import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';

const Wrapper = styled.div`
    height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 20px;
    padding-left: 30px;
    padding-right: 30px;
`

const HeaderContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    margin-bottom: 10px;
`

const GridView = styled.div`
    display: grid;
    height: 100%;
    width: 100%;
    grid-template-columns: 1fr 1fr 1fr;
    grid-auto-rows: minmax(100px, auto);
    column-gap: 10px;
    row-gap: 10px;
`

const UserPostWrapper = styled.div`
    height: 100%;
    width: 100%;
    padding: 5px;
    background-color: rgba(0, 0, 0, 0.1);
    position: relative;
    border-radius: 5px;
`

const UserPostDelete = styled.div`
    display: flex;
    position: absolute;
    justify-content: center;
    align-items: center;
    top: -5px;
    right: -5px;
    height: 25px;
    width: 25px;
    border-radius: 13px;
    background-color: #FF6961;
    transition: height 0.2s ease, width 0.2s ease;
    z-index: 10;
    cursor: pointer;

    :hover {
        height: 27px;
        width: 27px;
    }
`

const UserImage = styled.img`
    width: 100%;
    height: 100%;
`


function UserPost(props) {
    const { backgroundImage } = props.userPost;

    return (
        <UserPostWrapper>
            <UserPostDelete><DeleteIcon style={{fontSize: "14px", color: "white"}}/></UserPostDelete>
            <UserImage alt="Random" src={`data:image/jpeg;base64, ${backgroundImage}`}></UserImage>
        </UserPostWrapper>
    )
}

export default function UserPosts() {
    const [userPosts, setUserPosts] = useState([{}, {}, {}, {}, {}, {}]);

    return (
        <Wrapper>
            <HeaderContainer><Typography variant="h3" component="div">Your Posts</Typography></HeaderContainer>
            <GridView>
                {
                    userPosts.map(post => {
                        post.backgroundImage = "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAIAAADTED8xAAADMElEQVR4nOzVwQnAIBQFQYXff81RUkQCOyDj1YOPnbXWPmeTRef+/3O/OyBjzh3CD95BfqICMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMO0TAAD//2Anhf4QtqobAAAAAElFTkSuQmCC";
                        return <UserPost userPost={post}/>
                    })
                }
            </GridView>
        </Wrapper>
    )
}


