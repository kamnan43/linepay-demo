import React from 'react';
import ReactDOMServer from 'react-dom/server';
import swal from 'sweetalert2'

function showSelectedItem(selectedMenu, cb) {
  return new Promise((resolve, reject) => {
    swal({
      title: selectedMenu.name,
      text: `ราคา ${selectedMenu.regular_price} บาท`,
      imageUrl: selectedMenu.images[0].src,
      imageWidth: 400,
      imageHeight: 200,
      imageAlt: selectedMenu.name,
      animation: false,
      showCloseButton: true,
      showCancelButton: true,
      showConfirmButton: true,
    }).then((result) => {
      if (result.value) {
        swal({
          position: 'top-end',
          type: 'success',
          title: 'เพิ่มรายการแล้ว',
          showConfirmButton: false,
          timer: 800
        })
        resolve(selectedMenu);
      }
    })
  });
}

const dialog = {
  showSelectedItem: showSelectedItem,
};
export default dialog;
