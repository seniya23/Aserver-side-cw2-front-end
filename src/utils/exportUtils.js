import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Papa from "papaparse";
import { format } from "date-fns";

/**
 * Export data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Output filename (without extension)
 */
export function exportToCSV(data, filename = "export") {
	const csv = Papa.unparse(data);
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = `${filename}_${format(new Date(), "yyyy-MM-dd_HHmm")}.csv`;
	link.click();
}

/**
 * Export chart to PNG image
 * @param {String} chartElementId - ID of chart container
 * @param {String} filename - Output filename (without extension)
 */
export async function exportChartImage(chartElementId, filename = "chart") {
	try {
		const element = document.getElementById(chartElementId);
		if (!element) {
			console.error(`Chart element with id '${chartElementId}' not found`);
			return;
		}

		const canvas = await html2canvas(element, {
			backgroundColor: "#ffffff",
			scale: 2,
			logging: false,
		});

		const link = document.createElement("a");
		link.href = canvas.toDataURL("image/png");
		link.download = `${filename}_${format(new Date(), "yyyy-MM-dd_HHmm")}.png`;
		link.click();
	} catch (error) {
		console.error("Error exporting chart:", error);
	}
}

/**
 * Generate PDF report with data tables and charts
 * @param {Object} config - Configuration object
 * @param {String} config.title - Report title
 * @param {Array} config.tables - Array of {title, data} objects
 * @param {Array} config.charts - Array of {id, title} objects
 * @param {String} config.filename - Output filename
 */
export async function generatePDFReport(config) {
	try {
		const { title, tables = [], charts = [], filename = "report" } = config;
		const pdf = new jsPDF();
		const pageWidth = pdf.internal.pageSize.getWidth();
		const pageHeight = pdf.internal.pageSize.getHeight();
		const margin = 15;
		const contentWidth = pageWidth - 2 * margin;
		const minSpaceForContent = 40;
		let yPosition = 20;

		// Add title
		pdf.setFontSize(20);
		pdf.setTextColor(30, 41, 59);
		pdf.text(title, pageWidth / 2, yPosition, { align: "center" });
		yPosition += 15;

		// Add metadata
		pdf.setFontSize(10);
		pdf.setTextColor(100, 100, 100);
		pdf.text(`Generated on: ${format(new Date(), "PPP p")}`, margin, yPosition);
		yPosition += 12;

		// Add tables
		for (const table of tables) {
			// Check if we need a new page
			if (yPosition > pageHeight - minSpaceForContent) {
				pdf.addPage();
				yPosition = 20;
			}

			// Table title
			pdf.setFontSize(12);
			pdf.setTextColor(30, 41, 59);
			pdf.text(table.title, margin, yPosition);
			yPosition += 8;

			// Create table HTML and convert to PDF
			if (table.data && table.data.length > 0) {
				const tableHtml = createTableHTML(table.data);
				const tableCanvas = await html2canvas(tableHtml, {
					backgroundColor: "#ffffff",
					scale: 1.5,
					logging: false,
				});
				const tableImage = tableCanvas.toDataURL("image/png");
				
				// Calculate proportional height with max constraint
				let tableHeight = (tableCanvas.height * contentWidth) / tableCanvas.width;
				tableHeight = Math.min(tableHeight, 120); // Max 120mm height

				if (yPosition + tableHeight > pageHeight - 20) {
					pdf.addPage();
					yPosition = 20;
				}

				pdf.addImage(tableImage, "PNG", margin, yPosition, contentWidth, tableHeight);
				yPosition += tableHeight + 12;
				removeTemporaryTable(tableHtml);
			}
		}

		// Add charts
		for (const chart of charts) {
			// Check if we need a new page
			if (yPosition > pageHeight - minSpaceForContent) {
				pdf.addPage();
				yPosition = 20;
			}

			const chartElement = document.getElementById(chart.id);
			if (chartElement) {
				pdf.setFontSize(12);
				pdf.setTextColor(30, 41, 59);
				pdf.text(chart.title, margin, yPosition);
				yPosition += 8;

				const canvas = await html2canvas(chartElement, {
					backgroundColor: "#ffffff",
					scale: 1.5,
					logging: false,
					useCORS: true,
				});

				const chartImage = canvas.toDataURL("image/png");
				
				// Calculate proportional height with max constraint
				let chartHeight = (canvas.height * contentWidth) / canvas.width;
				chartHeight = Math.min(chartHeight, 100); // Max 100mm height

				if (yPosition + chartHeight > pageHeight - 20) {
					pdf.addPage();
					yPosition = 20;
				}

				pdf.addImage(chartImage, "PNG", margin, yPosition, contentWidth, chartHeight);
				yPosition += chartHeight + 12;
			}
		}

		// Add footer to all pages
		const totalPages = pdf.getNumberOfPages();
		for (let i = 1; i <= totalPages; i++) {
			pdf.setPage(i);
			pdf.setFontSize(9);
			pdf.setTextColor(150, 150, 150);
			pdf.text(
				`Page ${i} of ${totalPages}`,
				pageWidth / 2,
				pageHeight - 10,
				{ align: "center" }
			);
		}

		pdf.save(`${filename}_${format(new Date(), "yyyy-MM-dd_HHmm")}.pdf`);
	} catch (error) {
		console.error("Error generating PDF report:", error);
	}
}

/**
 * Create temporary HTML table from data
 * @param {Array} data - Array of objects
 * @returns {HTMLElement} Table element
 */
function createTableHTML(data) {
	const table = document.createElement("table");
	table.style.cssText =
		"border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 11px;";

	// Create header
	const headerRow = table.insertRow();
	headerRow.style.cssText = "background-color: #1e293b; color: white;";

	const keys = Object.keys(data[0]);
	keys.forEach((key) => {
		const th = document.createElement("th");
		th.textContent = key;
		th.style.cssText =
			"border: 1px solid #ccc; padding: 8px; text-align: left; font-weight: bold;";
		headerRow.appendChild(th);
	});

	// Create data rows
	data.forEach((item, index) => {
		const row = table.insertRow();
		row.style.cssText =
			index % 2 === 0 ? "background-color: #f5f5f5;" : "background-color: white;";

		keys.forEach((key) => {
			const td = document.createElement("td");
			td.textContent = item[key];
			td.style.cssText = "border: 1px solid #ccc; padding: 6px;";
			row.appendChild(td);
		});
	});

	document.body.appendChild(table);
	return table;
}

/**
 * Remove temporary table from DOM
 */
export function removeTemporaryTable(table) {
	if (table && table.parentNode) {
		table.parentNode.removeChild(table);
	}
}

/**
 * Save filter preset to localStorage
 * @param {String} presetName - Name of the preset
 * @param {Object} filters - Filter object to save
 */
export function saveFilterPreset(presetName, filters) {
	const presets = JSON.parse(localStorage.getItem("filterPresets") || "{}");
	presets[presetName] = {
		...filters,
		savedAt: new Date().toISOString(),
	};
	localStorage.setItem("filterPresets", JSON.stringify(presets));
}

/**
 * Load filter preset from localStorage
 * @param {String} presetName - Name of the preset
 * @returns {Object} Filter object
 */
export function loadFilterPreset(presetName) {
	const presets = JSON.parse(localStorage.getItem("filterPresets") || "{}");
	return presets[presetName] || null;
}

/**
 * Get all saved filter presets
 * @returns {Array} Array of preset names
 */
export function getAllFilterPresets() {
	const presets = JSON.parse(localStorage.getItem("filterPresets") || "{}");
	return Object.keys(presets);
}

/**
 * Delete filter preset
 * @param {String} presetName - Name of the preset to delete
 */
export function deleteFilterPreset(presetName) {
	const presets = JSON.parse(localStorage.getItem("filterPresets") || "{}");
	delete presets[presetName];
	localStorage.setItem("filterPresets", JSON.stringify(presets));
}

/**
 * Export summary statistics to JSON
 * @param {Object} stats - Statistics object
 * @param {String} filename - Output filename
 */
export function exportStatsToJSON(stats, filename = "statistics") {
	const json = JSON.stringify(stats, null, 2);
	const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = `${filename}_${format(new Date(), "yyyy-MM-dd_HHmm")}.json`;
	link.click();
}
