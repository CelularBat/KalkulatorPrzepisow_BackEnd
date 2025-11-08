/* server/mongo_schemas/recipe_verify.js */

const log = require("../../Logger");

// from https://www.zhenghao.io/posts/verify-image-url
async function verifyIfImg(url) {
  return fetch(url, { method: 'HEAD' })
    .then(res => res.headers.get('Content-Type')?.startsWith('image') || false)
    .catch(err => {
      log.error(err);
      return false;
    });
}

async function verifyImageList(photoList) {
  if (!Array.isArray(photoList)) return [];
  const verified = [];
  const checks = photoList.map(async (url) => {
    try {
      const ok = await verifyIfImg(url);
      if (ok) {
        verified.push(url);
        log.debug("image verified: ", url);
      } else {
        log.warn(`${url} is not an image!`);
      }
    } catch (err) {
      log.error(`Error verifying image URL: ${url}`, err);
    }
  });
  await Promise.all(checks);
  return verified;
}

module.exports = { verifyIfImg, verifyImageList };
