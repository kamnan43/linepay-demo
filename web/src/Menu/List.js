import React, { Component } from 'react';
import { Carousel } from 'react-responsive-carousel';

class Menu extends Component {
  render() {
    let data = this.props.data.map((menu, index) => {
      return (
        <div key={menu.id}>
          <img src={menu.images[0].src} alt={menu.name} />
          <p className="legend">
            {menu.name} ({menu.regular_price} บาท)<br />
          </p>
        </div>
      );
    });
    return (
      <Carousel
        onClickItem={this.props.onClickImage}
        interval={2000}
        showThumbs={false}
        centerMode emulateTouch autoPlay dynamicHeight infiniteLoop>
        {data}
      </Carousel>
    );
  }
}

export default Menu;
