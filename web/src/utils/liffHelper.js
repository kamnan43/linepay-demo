const liff = window.liff;
let isInit = false;
let profile = {};
let liffInfo = {};

class liffHelper {
  init() {
    return new Promise((resolve, reject) => {
      if (!isInit) {
        liff.init(
          data => {
            liffInfo = data;
            isInit = true;
            resolve();
          },
          err => {
            console.log('Fail to init LIFF, please run inside LINE only');
            reject();
          }
        );
      } else {
        resolve();
      }
    });
  }

  getLIFFInfo() {
    return liffInfo;
  }

  getProfile() {
    return new Promise((resolve, reject) => {
      this.init()
        .then(() => {
          if (isInit && !profile.userId) {
            liff.getProfile()
              .then(pf => {
                profile = pf;
                resolve(profile);
              })
              .catch((err) => {
                console.log('get profile error', err);
                profile = {
                  userId: 'U4f9d55b31f313f297c4a1e08283d6456',
                };
                resolve(profile);
                // reject(err);
              });
          } else {
            resolve(profile)
          }
        })
        .catch(err => { reject(err) });
    });
  }

  closeWindow() {
    liff.closeWindow();
  }

  openWindow(url, external) {
    liff.openWindow({ url, external });
  }

  sendMessages(messages) {
    const messagesToSend = Array.isArray(messages) ? messages : [messages];
    return new Promise((resolve, reject) => {
      this.init()
        .then(() => {
          liff.sendMessages(messagesToSend)
            .then(() => {
              resolve();
            })
            .catch((err) => {
              reject(err);
            });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};
export default new liffHelper();