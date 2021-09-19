import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { store } from '../redux/redux'

const BackgroundWrapper = styled.div`
    height: 100%;
    min-width: 70%;
    background-color: white;
    margin-right: 10px;
    position: relative;
    display: flex;
    align-items: center;
    border: 1px solid #dbdbdb;
    border-radius: 3px;
`

const ArrowWrapper= styled.div`
    display: ${props => props.active ? "block" : "none"};
    min-height: 30px;
    min-width: 30px;
    border-radius: 20px;
    position: absolute;
    right: 5px;
    right: ${props => props.right ? "5px" : "auto"};
    left: ${props => props.left ? "5px" : "auto"};
    background-color: rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: 0.2s min-height, 0.2s min-width;
    z-index: 10;

    :hover {
        min-height: 33px;
        min-width: 33px;
    }
`

const PostView = styled.img`
    width: 100%;
    max-height: 95%;
    object-fit: contain;
`

export default function PostViewer() {
    const [images, setImages] = useState([]);
    const [imageTimes, setImageTimes] = useState([]);
    const [imageIds, setImageIds] = useState([]);

    const [lastIndex, setLastIndex] = useState(0); 
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [maxTimeValue, setMaxTimeValue] = useState(0);
    const [maxTimeIndex, setMaxTimeIndex] = useState(0);
    
    const [timeoutClearCallback, setTimeoutClearCallback] = useState(null);
    
    const[buttonActive, setButtonStatus] = useState(true);
    const[backButtonActive, setBackButtonStatus] = useState(false);

    useEffect(() => {
        
        setImages();
    }, [])

    function changeRecommendation(newMaxIndex, replace = false) {
        return () => {
            // Set the max index to the new index
            setMaxTimeIndex(newMaxIndex);
   
            fetch("192.168.162.63/nearest_image", {
                method: "POST",
                body: JSON.stringify({
                    uuid: store.getState().auth.user,
                    img_uuid: imageIds[newMaxIndex],
                    limit: 1,
                })
            }).then((res) => res.json())
            .then((json) => {
                setImages((images) => {
                    if (replace) {
                        setImageIds([...imageIds.slice(0, -1), json['img_uuid'][0]])
                        return [...images.slice(0, -1), json['image'][0]];
                    } else {
                        setImageIds([...imageIds, json['img_uuid'][0]]);
                        return [...images, json['image'][0]];
                    }
                })
            }, console.log).then(() => {
                setButtonStatus(true);
            })
        }
    }

    function onClick(direction = "right") {
        const TIME_WEIGHT = 1000;
        let currentIndex = lastIndex;
        const lastIndexTimeElapsed = Date.now() - timeElapsed;
        setTimeElapsed(Date.now());

        // Update the current index to be to where we were
        switch (direction) {
            case "left":
                currentIndex--;
                break;
            case "right":
                currentIndex++;
                break;
            default:
                return;
        }
        setLastIndex(currentIndex); // actually updates last index
        setBackButtonStatus(currentIndex !== 0);

        const newImageTimes = [...imageTimes];
        newImageTimes[lastIndex] += lastIndexTimeElapsed;
        
        clearTimeout(timeoutClearCallback);

        if (maxTimeIndex !== currentIndex) {
            setTimeoutClearCallback(setTimeout(changeRecommendation(currentIndex, true), maxTimeValue - imageTimes[currentIndex]));
        }

        if (currentIndex >= images.length - 1) {
            let i = 0
            newImageTimes.forEach((time) => {
                newImageTimes[i] = time - TIME_WEIGHT;
                i++;
            })

            setMaxTimeValue(maxTimeValue - TIME_WEIGHT);

            if (maxTimeValue < TIME_WEIGHT) {
                changeRecommendation(images.length-1);
            } else {
                changeRecommendation(maxTimeIndex);
            }

            setImageTimes(newImageTimes);

            // disableButton
            setButtonStatus(false);

            // tell database we've seen the image.

        }

        setImageTimes(newImageTimes);
    }

    return (
        <BackgroundWrapper>
            <ArrowWrapper onClick={() => onClick("right")} active={buttonActive} right ></ArrowWrapper>
            <ArrowWrapper onClick={() => onClick("left")} active={backButtonActive} left ></ArrowWrapper>
            <PostView src={`data:image/png;base64, ${images[lastIndex]}`}></PostView>
        </BackgroundWrapper>
    )
}
