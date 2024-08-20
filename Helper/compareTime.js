export const compareTwoTimes = (limit, timeInput, timeNow = new Date()) => {
    const timeDifference = timeNow - new Date(timeInput);
    return timeDifference < limit;
  };