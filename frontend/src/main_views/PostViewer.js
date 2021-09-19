import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { store } from '../redux/redux'
import { db } from '../firebase/firebaseConfig'
import { collection, doc, getDocs, getDoc } from "firebase/firestore"; 

const BackgroundWrapper = styled.div`
    height: 100%;
    min-width: 70%;
    width: 70%;
    background-color: white;
    margin-right: 10px;
    position: relative;
    display: flex;
    align-items: center;
    border: 1px solid #dbdbdb;
    border-radius: 3px;


    @media screen and (max-width: 1250px) {
        min-width: 80%;
    }
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
    min-width: 300px;
    max-height: 95%;
    object-fit: contain;
`

export default function PostViewer() {
    const pickImages = [];

    const [images, setImages] = useState([]);
    const [imageTimes, setImageTimes] = useState([]);
    const [imageIds, setImageIds] = useState([]);

    useEffect(() => {
        const docRef = doc(db, 'users', store.getState().auth.user);        
        getDoc(docRef).then((userDoc) => {
            let suggestedImgUuid = ''
            if (userDoc.data().posts.length > 0) {
                for (let i = userDoc.data().posts.length-1; i >= 0; i--) {
                    if ((i == 0) || (Math.floor(Math.random() * 2) == 0)) {  // if it wins the coinflip or is the last element
                        suggestedImgUuid = userDoc.data().posts[i]
                        break;
                    }
                }
            } else if (userDoc.data().most_valuable_image) {
                suggestedImgUuid = userDoc.data().most_valuable_image;
            }

            if (suggestedImgUuid !== '') {
                fetch("http://192.168.162.63:5000/nearest_image", {
                    method: "POST",
                    body: JSON.stringify({
                        uuid: store.getState().auth.user,
                        img_uuid: suggestedImgUuid,
                        limit: 2,
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then((res) => res.json())
                .then((json) => {
                    if (json['result']['img_uuid'].length == 2) {
                        setImages(json['result']['img']);
                        setImageIds(json['result']['img_uuid']);
                        setImageTimes([0, 0]);

                        markSeen(json['result']['img'][0]);
                        setImagePickMenuStatus(false);
                        setButtonStatus(true);
                    } else {
                        getDocs(collection(db, 'images')).then((querySnapshot) => {
                            querySnapshot.forEach((image) => {
                                if (pickImages.length < 9) {
                                    pickImages.push({
                                        img: image.data().image,
                                        uuid: image.data().uuid,
                                        img_uuid: image.id,
                                    });
                                }
                            });
                        });
                    }
                });
            }
        });
    }, [])

    const [lastIndex, setLastIndex] = useState(0); 
    const [timeElapsed, setTimeElapsed] = useState(Date.now());
    const [maxTimeValue, setMaxTimeValue] = useState(0);
    const [maxTimeIndex, setMaxTimeIndex] = useState(0);
    
    const [timeoutClearCallback, setTimeoutClearCallback] = useState(null);
    
    const[buttonActive, setButtonStatus] = useState(false);
    const[backButtonActive, setBackButtonStatus] = useState(false);
    const[imagePickMenuStatus, setImagePickMenuStatus] = useState(true);


    function changeRecommendation(newMaxIndex, replace = false) {
        return () => {
            // Set the max index to the new index
            setMaxTimeIndex(newMaxIndex);
            fetch("http://192.168.162.63:5000/nearest_image", {
                method: "POST",
                body: JSON.stringify({
                    uuid: store.getState().auth.user,
                    img_uuid: imageIds[newMaxIndex],
                    limit: 1,
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((res) => res.json())
            .then((json) => {
                if (json['result']['img'].length < 1) {
                    return false;
                } else {
                    if (replace) {
                        setImages((images) => {
                            return [...images.slice(0, -1), json['result']['img'][0]];
                        });
                        setImageIds((currentImageIds) => {
                            return [...currentImageIds.slice(0, -1), json['result']['img_uuid'][0]]
                        });
                    } else {
                        setImages((images) => {
                            return [...images, json['result']['img'][0]];
                        });
                        setImageTimes((times) => {
                            return [...times, 0];
                        })
                        setImageIds((currentImageIds) => {
                            return [...imageIds, json['result']['img_uuid'][0]];
                        });
                    }

                    return true;
                }
            }, console.log).then((status) => {
                if (status) {
                    setButtonStatus((currentStatus) => true);
                }
            })
        }
    }

    function markSeen(imageId) {
        return fetch("http://192.168.162.63:5000/mark_seen", {
            method: "POST",
            body: JSON.stringify({
                uuid: store.getState().auth.user,
                img_uuid: imageId,
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        })
    }

    function markValuableImage(imageId) {
        return fetch("http://192.168.162.63:5000/mark_valuable_image", {
            method: "POST",
            body: JSON.stringify({
                uuid: store.getState().auth.user,
                img_uuid: imageId,
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        })
    }

    function onClick(direction = "right") {
        const TIME_WEIGHT = 1000;
        let currentIndex = lastIndex;
        let updatedMaxTimeValue = maxTimeValue;
        let updatedMaxTimeIndex = maxTimeIndex;
        const lastIndexTimeElapsed = Date.now() - timeElapsed;
        setTimeElapsed(Date.now());

        // Update the current index to be to where we were
        switch (direction) {
            case "left":
                currentIndex--;
                setButtonStatus((currentStatus) => true);
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

        if (newImageTimes[lastIndex] > maxTimeValue) {
            updatedMaxTimeValue = newImageTimes[lastIndex];
            updatedMaxTimeIndex = lastIndex;
        }

        if (updatedMaxTimeIndex !== currentIndex) {
            setTimeoutClearCallback(setTimeout(changeRecommendation(currentIndex, true), updatedMaxTimeValue - imageTimes[currentIndex]));
        }

        if (currentIndex >= images.length - 1) { // if we reach the last img in the array and we need to get a new one
            let i = 0
            newImageTimes.forEach((time) => {
                newImageTimes[i] = time - TIME_WEIGHT;
                i++;
            })

            setMaxTimeValue(updatedMaxTimeValue - TIME_WEIGHT);

            if (updatedMaxTimeValue < TIME_WEIGHT) {
                changeRecommendation(images.length-1)();
            } else {
                changeRecommendation(updatedMaxTimeIndex)();
            }

            setImageTimes(newImageTimes);

            // disableButton
            setButtonStatus(false);

            // tell database we've seen the image.
            markSeen(imageIds[currentIndex]);
        }

        setImageTimes(newImageTimes);
    }

    if (imagePickMenuStatus) {
        return (
            <BackgroundWrapper>
            </BackgroundWrapper>
        )
    } else {
        return (
            <BackgroundWrapper>
                <ArrowWrapper onClick={() => onClick("right")} active={buttonActive} right ></ArrowWrapper>
                <ArrowWrapper onClick={() => onClick("left")} active={backButtonActive} left ></ArrowWrapper>
                <PostView src={`data:image/png;base64, ${images[lastIndex]}`}></PostView>
            </BackgroundWrapper>
        )
    }
}
