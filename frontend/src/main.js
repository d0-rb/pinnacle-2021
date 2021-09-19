import React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Feed from './feed'
import './main.css'

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  margin: theme.spacing(1),
}));

class MainPage extends React.Component {
  constructor(props) {
    super(props);


  }

  render() {
    return (
      <Container maxWidth="xl">
        <Box sx={{ height: '100vh' }}>
          <Grid container spacing={2}>
            <Grid item xs={7}>
              <Feed user={this.props.user} />
            </Grid>
            <Grid item xs={5}>
              <Item>rightside</Item>
            </Grid>
          </Grid>
        </Box>
      </Container>
    );
  }
}

export default MainPage;
