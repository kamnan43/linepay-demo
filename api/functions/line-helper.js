const maxCarouselColumns = 10;

function createTextMessage(text) {
  return {
    type: 'text',
    text: text
  };
}

function createImageMessage(originalContentUrl, previewImageUrl) {
  return {
    type: 'image',
    originalContentUrl: originalContentUrl,
    previewImageUrl
  };
}

function createButtonMessage(title, actions) {
  return {
    type: 'template',
    altText: title,
    template: {
      type: 'buttons',
      text: title.substring(0, 60),
      actions: actions,
    },
  };
}

function createConfirmMessage(title, actions) {
  return {
    type: 'template',
    altText: title,
    template: {
      type: 'confirm',
      text: title,
      actions: actions,
    },
  };
}

function createCarouselMessage(title, columns) {
  return {
    type: 'template',
    altText: title,
    template: {
      type: 'carousel',
      columns: columns,
    },
  };
}

function createImageCarouselMessage(title, columns) {
  return {
    type: 'template',
    altText: title,
    template: {
      type: 'image_carousel',
      columns: columns,
    },
  };
}

function createFlexMessage(title, containers) {
  return {
    "type": "flex",
    "altText": title,
    "contents": containers 
  };
}

function createFlexCarouselMessage(title, containers) {
  return createFlexMessage(title, {
    "type": "carousel", 
    "contents": containers,
  });
}

module.exports = {
  createTextMessage: createTextMessage,
  createImageMessage: createImageMessage,
  createButtonMessage: createButtonMessage,
  createConfirmMessage: createConfirmMessage,
  createCarouselMessage: createCarouselMessage,
  createImageCarouselMessage: createImageCarouselMessage,
  createFlexMessage: createFlexMessage,
  createFlexCarouselMessage: createFlexCarouselMessage,
  maxCarouselColumns: maxCarouselColumns
};