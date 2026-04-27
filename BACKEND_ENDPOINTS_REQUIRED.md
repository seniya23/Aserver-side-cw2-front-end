// REQUIRED BACKEND ENDPOINTS FOR ADMIN BIDDING PAGE
// Add these routes to your biddingRouter.js and implement them in biddingsystemController.js

// 1. GET /api/bidding/admin/all-bids
// Returns: Array of all bids with fields: id, firstName, lastName, email, bidAmount, bidDate, status
// Permission: read:bidding

// 2. GET /api/bidding/admin/active-bids
// Returns: Array of currently active bids
// Permission: read:bidding

// 3. GET /api/bidding/admin/winners
// Returns: Array of bids that have won
// Permission: read:bidding

// 4. GET /api/bidding/admin/stats
// Returns: Object with statistics
// Example response: { totalBids: 10, activeBids: 3, totalWinners: 2, avgBidAmount: 250 }
// Permission: read:bidding

// Add this import to biddingRouter.js:
// import { adminGetAllBids, adminGetActiveBids, adminGetWinners, adminGetStats } from "../controllers/biddingsystemController.js";

// Add these routes to biddingRouter.js:
/*
biddingRouter.get("/admin/all-bids", adminGetAllBids);
biddingRouter.get("/admin/active-bids", adminGetActiveBids);
biddingRouter.get("/admin/winners", adminGetWinners);
biddingRouter.get("/admin/stats", adminGetStats);
*/

// EXAMPLE IMPLEMENTATIONS for biddingsystemController.js:

/*
export function adminGetAllBids(req, res) {
    if (!req.apiPermissions || !req.apiPermissions.includes("read:bidding")) {
        return res.status(403).json({ message: "Insufficient permissions" });
    }

    biddingTable.all(
        `SELECT b.id, b.email, b.bid_amount as bidAmount, b.bid_date as bidDate, 
                b.status, a.first_name as firstName, a.last_name as lastName
         FROM bidding b 
         JOIN alumni a ON b.email = a.email 
         ORDER BY b.bid_date DESC`,
        [],
        (err, bids) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }
            res.json(bids || []);
        }
    );
}

export function adminGetActiveBids(req, res) {
    if (!req.apiPermissions || !req.apiPermissions.includes("read:bidding")) {
        return res.status(403).json({ message: "Insufficient permissions" });
    }

    biddingTable.all(
        `SELECT b.id, b.email, b.bid_amount as bidAmount, b.bid_date as bidDate, 
                b.status, a.first_name as firstName, a.last_name as lastName
         FROM bidding b 
         JOIN alumni a ON b.email = a.email 
         WHERE b.status = 'active'
         ORDER BY b.bid_amount DESC`,
        [],
        (err, bids) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }
            res.json(bids || []);
        }
    );
}

export function adminGetWinners(req, res) {
    if (!req.apiPermissions || !req.apiPermissions.includes("read:bidding")) {
        return res.status(403).json({ message: "Insufficient permissions" });
    }

    biddingTable.all(
        `SELECT b.id, b.email, b.bid_amount as bidAmount, b.bid_date as bidDate, 
                b.status, a.first_name as firstName, a.last_name as lastName
         FROM bidding b 
         JOIN alumni a ON b.email = a.email 
         WHERE b.status = 'won'
         ORDER BY b.bid_date DESC`,
        [],
        (err, bids) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }
            res.json(bids || []);
        }
    );
}

export function adminGetStats(req, res) {
    if (!req.apiPermissions || !req.apiPermissions.includes("read:bidding")) {
        return res.status(403).json({ message: "Insufficient permissions" });
    }

    biddingTable.all(
        `SELECT COUNT(*) as totalBids, 
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeBids,
                SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as wonBids,
                AVG(bid_amount) as avgBidAmount,
                MAX(bid_amount) as maxBidAmount
         FROM bidding`,
        [],
        (err, stats) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }
            res.json(stats[0] || {});
        }
    );
}
*/
