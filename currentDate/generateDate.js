const options = {
  weekday: 'long',
  day: 'numeric',
  month: 'long'
};
var today = new Date();
module.exports = today.toLocaleDateString('en-US', options);
