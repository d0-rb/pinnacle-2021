import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Dialog from '@mui/material/Dialog';
import { db } from '../firebase/firebaseConfig'
import { collection, getDocs } from "firebase/firestore"; 

const DialogInnerContainer = styled.div`
    height: 800px;
    width: 1200px;
    background-color: white;
    display: flex;
    flex-direction: column;
`

const HeaderContainer = styled.div`
    height: 150px; 
    min-height: 150px;
    width: 100%;
    justify-content: center;
    align-items: center;
    display: flex;
    flex-direction: row;
    position: relative;
`

const Header = styled.h2`
    margin: 0;
    padding: 0;
    margin-bottom: 5px;
`

const GridView = styled.div`
    display: grid;
    height: 100%;
    max-width: 1200px;
    grid-template-columns: 1fr 1fr 1fr;
    grid-auto-rows: min-content;
    column-gap: 10px;
    row-gap: 10px;
    padding-left: 20px;
    padding-right: 20px;
`

const UserPostWrapper = styled.div`
    padding: 5px;
    background-color: rgba(0, 0, 0, 0.1);
    position: relative;
    border-radius: 5px;
    display: flex;
    align-items: center;
    transition: background-color 0.2s;
    cursor: pointer;

    :hover {
        background-color: rgba(0, 0, 0, 0.3);
    }
`

const UserImage = styled.img`
    max-width: 100%;
`

const OutlineDiv = styled.div`
    pointer-events: none;
    border: 1px solid black;
    position: fixed;
    background-color: rgba(0, 0, 0, 0);
    border-radius: 5px;
`

const SelectImage = styled.button`
    position: absolute;
    right: 20px;
    outline: none;
    border-radius: 3px;
    border: none;
    height: 40px;
    width: 90px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    color: black;
    font-weight: bold;
    transition: background-color 0.2s;

    :active:hover:not([disabled]) {
        background-color: rgb(230, 230, 230)
    }

`

function ImageOption(props) {
    const { backgroundImage, selectPost } = props.imageOption;
    const { idForRender } = props
    
    function postOnClick() {
        selectPost();
    }

    return (
        <UserPostWrapper onClick={postOnClick} id={idForRender}>
            <UserImage alt="Random" src={`data:image/jpeg;base64, ${backgroundImage}`}></UserImage>
        </UserPostWrapper>
    )
}

export default function ImagePicker(props) {
    const { open, chooseImage, closeModalCallback } = props;
    const [pickedPhoto, setPickedPhoto] = useState(null);
    const [photoOptions, setPhotoOptions] = useState([]);
    const [outlineData, setOutlineData] = useState({});

    function closeModal() {
        chooseImage(pickedPhoto);
        closeModalCallback();
    }

    useEffect(() => {
        getDocs(collection(db, 'images')).then(querySnapshot => {
            const pickImages = []
            querySnapshot.forEach((image) => {
                if (pickImages.length < 9) {
                    pickImages.push({
                        img: image.data().image,
                        uuid: image.data().uuid,
                        img_uuid: image.id,
                    });
                }
            });

            setPhotoOptions(pickImages)
        });
    }, [])

    return (
        <Dialog maxWidth="l" style={{height: "100%", width: "100%"}} open={open}>
            <OutlineDiv style={{top: outlineData.top, left: outlineData.left, height: outlineData.height, width: outlineData.width}}/>
            <DialogInnerContainer>
                <HeaderContainer>
                    <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                        <Header>Select your favorite image!</Header>
                        <div style={{height: "1px", width: "275px", backgroundColor: "rgba(0,0,0,0.5)"}}></div>
                    </div>
                    <SelectImage onClick={closeModal} disabled={pickedPhoto === null}>Next</SelectImage>
                </HeaderContainer>
                <GridView>
                    {
                        photoOptions.map(option => {
                            let imageOption = {
                                backgroundImage: option.img,
                                selectPost: () => {

                                    setPickedPhoto(option.img_uuid);
                                    const query = document.getElementById(option.img_uuid).getBoundingClientRect();
                                    setOutlineData({
                                        top: query.top,
                                        left: query.left,
                                        height: query.height,
                                        width: query.width
                                    })
                                },
                                imgId: option.img_uuid
                            }
                            return <ImageOption idForRender={imageOption.imgId} key={imageOption.imgId} imageOption={imageOption}/>
                        })
                    }
                </GridView>
            </DialogInnerContainer>
        </Dialog>
    )
}
