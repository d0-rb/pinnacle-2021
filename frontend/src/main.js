import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

class MainPage extends React.Component {
  constructor(props) {
    super(props);


  }

  render() {
    return (
      <Container maxWidth="xl">
        <Box sx={{ bgcolor: '#cfe8fc', height: '100vh' }} />
      </Container>
    );
  }
}

export default MainPage;
