function leftPad(value) {
    if (value >= 10) {
        return value;
    }

    return `0${value}`;
}

// function toStringByFormatting(source, delimiter = '-') {
//     const year = source.getFullYear();
//     const month = leftPad(source.getMonth() + 1);
//     const day = leftPad(source.getDate());

//     return [year, month, day].join(delimiter);
// }

const getDate = {
    date2String : (source, delimiter = '-') => {
        const year = source.getFullYear();
        const month = leftPad(source.getMonth() + 1);
        const day = leftPad(source.getDate());
    
        return [year, month, day].join(delimiter);
    }
};

module.exports = getDate;