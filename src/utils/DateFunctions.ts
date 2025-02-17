export const dateDiff = (date1:Date, date2:Date) => {
    var time_difference = date1.getTime() - date2.getTime();  
    return time_difference / (1000 * 60 * 60 * 24);  
}