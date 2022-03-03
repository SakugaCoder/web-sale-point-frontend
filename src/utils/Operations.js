const getTotal = (items) => {
    let total = 0;
    console.log('getting total');
    items.forEach( (item,index) => {
        total += item.price * item.kg;
    });

    total = total.toFixed(2);

    // console.log(total);

    return total;
};

export { getTotal };