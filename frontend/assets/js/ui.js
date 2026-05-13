let FilterForm = document.getElementById("FilterForm");
FilterForm.addEventListener("change", function (event) {
        console.log("new value!", event.target);

    })

    let SearchForm = document.getElementById("SearchForm");    
    SearchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        let SearchInput = SearchForm.SearchInput.value;
        console.log("new value!", SearchForm.SearchInput);

    })


    //det verkar att search funkar inte utan submit
    // så  gjorde jag två former for search och sortering

    