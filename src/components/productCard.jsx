import { Link } from "react-router-dom";

export function ProductCard(props){

    // <ProductCard name="Laptop" price="100,000.00" image="https://techterms.com/img/xl/laptop_586.png"/> these pasing values from 
    // App.jsx coming as json data as props ,if we print those props you can see the values are pass as props
    const product = props.product;
    console.log(props)
    return(
        // hoover keraddi view details button eka pennanawa, image eka change wena part eka
        //And overview ekath ekka productID eka ellala yawanne ethekota product overview page eke link eka friend kenekta yawwama friendta product eka pennanawa, nattan eya kalin page eke idelama enna one ee kiyanne productpage eke idelama, example site daraz
        <Link to={"/overview/" + product.productID} className="w-[300px] h-[400px]  m-4 shadow-2xl cursor-pointer relative hover:[&_.buttons]:opacity-100 hover:[&_.primary-image]:opacity-0">

			<div className="w-full h-[250px]  relative">
				<img
					src={product.images[1]}
					className="w-full h-full absolute bg-white object-cover"/>
				<img
					src={product.images[0]}
					className="w-full h-full absolute bg-white primary-image transition-opacity duration-500 object-cover"/>
                    {/* product.image[0] is the main image and product.image[1] is the secondary image it will show when hover */}
			</div>
			
			<div className="w-full h-[150px] p-2 flex flex-col  justify-between">
				<h1 className="text-center text-lg">{product.name}</h1>
				<div className="w-full flex flex-col items-center">
					{
                        // if the labelled price is greater than the price, show the labelled price with a line through it
						product.labelledPrice > product.price &&
						<h2 className="text-secondary/80 line-through decoration-gold/70 decoration-2 mr-2">
							LKR. {product.labelledPrice.toFixed(2)}
						</h2>
					}
					<h2 className="text-accent font-semibold text-2xl">
                        {/* we use toFixed(2) to show 2 decimal places for the price ex: 1000.00 */}
						LKR. {product.price.toFixed(2)} 
					</h2>

				</div>
			</div>

			<div className="w-full h-[150px] bottom-0 opacity-0 absolute buttons bg-white flex flex-row gap-4 justify-center items-center transition-opacity duration-300">
				<button  className="border-2 border-accent text-accent hover:bg-accent hover:text-white transition-colors duration-150 h-[50px] w-[150px] flex justify-center items-center">View Details</button >
			</div>
			
		</Link>
    )
}