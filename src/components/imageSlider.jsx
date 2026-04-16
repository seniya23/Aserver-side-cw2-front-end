import { useState } from "react";

export default function ImageSlider(props) {
    const images = props.images;
    const [activeIndex, setActiveIndex] = useState(0); //for this part we use useState to keep track of the active image index(lokuwata watena image eka yata images select kerayn passe)
    return (
        <div className="w-full flex flex-col items-center ">
            <img src={images[activeIndex]} className="w-[80%] h-[500px]  object-contain"/>
            <div className="w-full h-[100px] flex flex-row justify-center gap-4 items-center">
                {
                    images.map(
                        (image, index)=>{
                            return(
                                <img src={images[index]} className={"w-[90px] h-[90px] object-cover rounded-lg "+((activeIndex==index)?" border-2 border-accent": " ")} onClick={
                                    ()=>{
                                        setActiveIndex(index) //when clicking on the thumbnail image, set the activeIndex to the index of the clicked image
                                    }
                                }/>
                            )
                        }
                    )
                }
            </div>
        </div>
    );
}

//object-cover use for css it  will cover the image container without distorting the image aspect ratio(loku image ekak, podi image ekak unath container eke width ekatay hight ekatay galepena widihata hadagannawa)
//object-cover rounded-lg "+((activeIndex==index)?" border-2 border-accent": " " this means selecting object(activeIndex==index) need to cover from a border else (: " ") no border