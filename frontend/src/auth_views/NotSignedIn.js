import React from 'react'
import styled from 'styled-components';
import { Typography } from '@mui/material';

const Outer = styled.div`
    display: flex;
    height: 100vh;
    width: 100vw;
    justify-content: center;
    align-items: center;
`

export default function NotSignedIn(props) {
    return (
        <Outer>
            <Typography variant="h4" component="div">{props.message}</Typography>
        </Outer>
    )
}
