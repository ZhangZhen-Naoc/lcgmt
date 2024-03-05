
function createTag(name,is_selected){
    // create span element:
    

    // Create and append the `Alabama` option within the `select` element
    const option= document.createElement('option');
    option.value = name
    option.text = name;
    if (is_selected){

        option.setAttribute('selected','selected')
    }
    return option
}
