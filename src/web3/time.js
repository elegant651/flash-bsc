const currentUnixTime = () => {
  return Math.floor((new Date()).getTime() / 1000);
}

const getTimeInString = (unixTimestamp) => {
  const tempTime = new Date(unixTimestamp * 1000)
    .toISOString()
    .replace('Z', ' ')
    .replace('T', ' ');

  const index = tempTime.indexOf('.');

  return tempTime.substring(0, index) + ' UTC';
}

const getRemaingTime = (future) => {  
  const distance = Number(future) - currentUnixTime();

  const days = Math.floor(distance / (60 * 60 * 24));
  const hours = Math.floor((distance % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((distance % (60 * 60)) / (60));
  const seconds = Math.floor((distance % (60)));

  return days + "d " + hours + "h " + minutes + "m " + seconds + "s";
};

export const time = {
  currentUnixTime,
  getTimeInString,
  getRemaingTime,
};
