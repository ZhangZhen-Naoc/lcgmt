function onPVSubmit(event){
    var form = document.getElementById("pv_form");
    event.preventDefault();
    if (!form['rec_file'].value){
        window.alert("Please select a file");

        return false;
    }
    form.submit()
}

form = document.getElementById("pv_form");
form.addEventListener("submit", onPVSubmit);
