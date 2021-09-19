import React from 'react';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ButtonBase from '@mui/material/ButtonBase';
import './feed.css'
import '../main.css'

class Feed extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      images: [],
      likes: [],
      lookIndex: 0,
      previousIndex: 0,
    }

    const seen_images = {
      'https://post.medicalnewstoday.com/wp-content/uploads/sites/3/2020/02/322868_1100-800x825.jpg': true,
      'https://i.ytimg.com/vi/MPV2METPeJU/maxresdefault.jpg': true,
      'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/golden-retriever-royalty-free-image-506756303-1560962726.jpg': true,
    }
    // TODO: given this.props.user, get not-seen-images and store them in state.images
  }

  nextImage = (event) => {
    this.setState({
      previousIndex: this.state.lookIndex,
      lookIndex: this.state.lookIndex + 1
    });
  }

  prevImage = (event) => {
    this.setState({
      previousIndex: this.state.lookIndex,
      lookIndex: this.state.lookIndex - 1
    });
  }

  render() {
    const { lookIndex, previousIndex } = this.state;
    const img_url = this.state.images[lookIndex]

    let anim = 'slide-in-right';
    if (lookIndex < previousIndex) { // if they moved back an index
      anim = 'slide-in-left';
    }

    return (
      <Paper id="flex-vert" sx={{ overflow: 'hidden', position: 'relative' }}>
        <div id="flex-horiz">
          <img src={img_url} className={`feed-image ${anim}`} />
          <ButtonBase
            className={'max-height button-width gradient-right overlay top-right'}
            onClick={this.nextImage}
          >
            <div >
              <ArrowForwardIosIcon />
            </div>
          </ButtonBase>
          <ButtonBase
            className={'max-height button-width gradient-left overlay top-left'}
            onClick={this.prevImage}
          >
            <div >
              <ArrowBackIosIcon />
            </div>
          </ButtonBase>
        </div>
        <Paper>
          <IconButton aria-label="like">
            <FavoriteBorderIcon />
          </IconButton>
          Posted by
        </Paper>
      </Paper>
    );
  }
}

export default Feed;
