let booksData = [];
const Genres = [
    'Action',
    'Adventure',
    'Artificial Intelligence',
    'Attractive Lead',
    'Comedy',
    'Contemporary',
    'Cyberpunk',
    'Drama',
    'Dystopia',
    'Fan Fiction',
    'Fantasy',
    'Female Lead',
    'First Contact',
    'GameLit',
    'Gender Bender',
    'Genetically Engineered ',
    'Grimdark',
    'Hard Sci-fi',
    'Harem',
    'High Fantasy',
    'Historical',
    'Horror',
    'LitRPG',
    'Low Fantasy',
    'Magic',
    'Male Lead',
    'Martial Arts',
    'Multiple Lead Characters',
    'Mystery',
    'Mythos',
    'Non-Human Lead',
    'Original',
    'Progression',
    'Psychological',
    'Reader Interactive',
    'Reincarnation',
    'Romance',
    'Ruling Class',
    'Satire',
    'School Life',
    'Sci-fi',
    'Secret Identity',
    'Short Story',
    'Slice of Life',
    'Soft Sci-fi',
    'Space Opera',
    'Sports',
    'Steampunk',
    'Strategy',
    'Strong Lead',
    'STUB',
    'Supernatural',
    'Technologically Engineered',
    'Tragedy',
    'Villainous Lead',
    'War and Military',
    'Wuxia'
];
var filterState = false;

function htmlDecode(input) {
    var doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
}

function loadBooks() {
    var xhttp = new XMLHttpRequest();
    // xhttp.open("GET", "http://192.168.1.100:8000/getBooks", false);
    xhttp.open("GET", "/getBooks", false);
    // 3xhttp.setRequestHeader("Access-Control-Allow-Origin", "*");
    xhttp.send(null);
    generateBooks(xhttp.responseText);
    genFilterTab();
    return xhttp.responseText;
}

function getCheckedElements() {
    results = [];
    var inputs = document.querySelectorAll("input[type='checkbox']");
    for(var i = 0; i < inputs.length; i++) {
        // console.log(inputs[i].name);   
        // console.log(inputs[i].checked);
        if (inputs[i].checked) {
            results.push(inputs[i].name);
        }
    }
    var completedValue;
    if (document.getElementById("completedId").value == "Yes") {
        completedValue = true;
    } else {
        completedValue = false;
    }
    var bookMarkedValue;
    if (document.getElementById("bookmarkInput").value == "Yes") {
        bookMarkedValue = true;
    } else {
        bookMarkedValue = false;
    }
    console.log("completed: " + document.getElementById("completedId").value);
    console.log("bookmarked: " + document.getElementById("bookmarkInput").value);
    console.log(completedValue);
    console.log(completedValue);
   
    loadFilterBooks(results, document.getElementById("pagesInput").value, document.getElementById("ratingInput").value, completedValue, document.getElementById("sortBy").value, document.getElementById("sortOrder").value, bookMarkedValue);
}

function loadFilterBooks(genres = [], pages = 0, rating = 0, read = false, sortby = "rating", sortOrder = -1, bookmarked=false) {
    if (rating == "") {
        rating = 0;
    }
    if (pages == "") {
        pages = 0;
    }
    const filterData = {
        genre: genres,
        pages: pages,
        rating: rating,
        read: read,
        sort_by: sortby,
        sort_order: sortOrder,
        bookmarked: bookmarked
    };
    sessionStorage.setItem("lastFilters", JSON.stringify(filterData));
    var xhttp = new XMLHttpRequest();
    
    xhttp.open("POST", "/getFilterBooks/", false);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({ "genre": genres, "pages": pages, "rating": rating, "read": read, "sort_by": sortby, "sort_order": sortOrder, "bookmarked": bookmarked }));
    var currentBooks = document.getElementById("booksDiv");
    currentBooks.remove();
    generateBooks(xhttp.responseText);
    // location.reload();
    return xhttp.responseText;
}

function completeBook(bookName) {
    var xhttp = new XMLHttpRequest();
    // xhttp.open("POST", "http://192.168.1.100:8000/completeBook/", false);
    xhttp.open("POST", "/completeBook/", false);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({ "book": bookName }));
    // console.log({"book": bookName});
    // generateBooks(xhttp.responseText);
    reloadWithLastFilters();
    return xhttp.responseText;
}


function bookmarkBook(bookName) {
    var xhttp = new XMLHttpRequest();
    // xhttp.open("POST", "http://192.168.1.100:8000/bookmark/", false);
    xhttp.open("POST", "/bookmark/", false);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({ "book": bookName }));
    // generateBooks(xhttp.responseText);
    reloadWithLastFilters();
    return xhttp.responseText;
}

function genFilterTab() {

    var form = document.getElementById("filterForm");
    form.style.display = "none";

    lineBreak = 0;

    // rating label for filter
    form.appendChild(addLineBreak());
    var ratingInput = document.createElement("input");
    ratingInput.type = "text";
    ratingInput.size = 5;
    ratingInput.id = "ratingInput";
    var ratingLabel = document.createElement("label");
    ratingLabel.appendChild(document.createTextNode("Rating "));
    form.appendChild(ratingLabel);
    form.appendChild(ratingInput);
    form.appendChild(addLineBreak());
    form.appendChild(addLineBreak());

    // pages filter
    var pagesInput = document.createElement("input");
    pagesInput.type = "text";
    pagesInput.size = 5;
    pagesInput.id = "pagesInput";
    var pagesLabel = document.createElement("label");
    pagesLabel.appendChild(document.createTextNode("Pages "));
    form.appendChild(pagesLabel);
    form.appendChild(pagesInput);
    form.appendChild(addLineBreak());
    form.appendChild(addLineBreak());

    // bookmarked filter
    var bookmarkInput = document.createElement("select");
    bookmarkInput.id = "bookmarkInput";

    var optionYes = document.createElement("option");
    optionYes.appendChild(document.createTextNode("Yes"));
    var optionNo = document.createElement("option");
    optionNo.appendChild(document.createTextNode("No"));

    bookmarkInput.appendChild(optionYes);
    bookmarkInput.appendChild(optionNo);

    var bookmarkLabel = document.createElement("label");
    bookmarkLabel.appendChild(document.createTextNode("Bookmarked "));
    form.appendChild(bookmarkLabel);
    form.appendChild(bookmarkInput);
    form.appendChild(addLineBreak());
    form.appendChild(addLineBreak());

    //option for including completed books
    var completed = document.createElement("select");
    var completedLabel = document.createElement("label");
    completed.id = "completedId";

    var optionYes = document.createElement("option");
    optionYes.appendChild(document.createTextNode("Yes"));
    var optionNo = document.createElement("option");
    optionNo.appendChild(document.createTextNode("No"));

    completed.appendChild(optionYes);
    completed.appendChild(optionNo);
    completedLabel.appendChild(document.createTextNode("Include completed  "));
    form.appendChild(completedLabel);
    form.appendChild(completed);
    form.appendChild(addLineBreak());
    form.appendChild(addLineBreak());

    //sorting by options
    var sortLabel = document.createElement("label");
    sortLabel.appendChild(document.createTextNode("Sort  "));
    form.appendChild(sortLabel);
    var selectArr = ["rating", "pages"];
    var selectList = document.createElement("select");
    selectList.id = "sortBy";
    for (var i = 0; i < selectArr.length; i++) {
        var option = document.createElement("option");
        option.value = selectArr[i];
        option.text = selectArr[i];
        selectList.appendChild(option);
    }
    form.appendChild(selectList);

    // sorting order: ascending/descending
    var sortOrder = document.createElement("select");
    sortOrder.id = "sortOrder";
    var asc = document.createElement("option");
    asc.value = 1;
    asc.text = "ascending";
    var des = document.createElement("option");
    des.value = -1;
    des.text = "descending";
    sortOrder.appendChild(asc);
    sortOrder.appendChild(des);
    form.appendChild(sortOrder);
    

    form.appendChild(addLineBreak());
    form.appendChild(addLineBreak());
    
    //<button onclick="getCheckedElements()" type="button">filter</button>
    var confirmButton = document.createElement("button");
    confirmButton.id = "filterConfirm";
    confirmButton.onclick = function () { getCheckedElements(); };
    confirmButton.type = "button";

    var buttonLabel = document.createElement("label");
    buttonLabel.appendChild(document.createTextNode("filter"));
    confirmButton.appendChild(buttonLabel);
    form.appendChild(confirmButton);
    form.appendChild(addLineBreak());

    
    for (var key in Genres) {
        // book number 
        var check = document.createElement("input");
        check.type = "checkbox";
        check.name = Genres[key];
        // check.style.cssText
        var text = document.createElement("label");
        text.for = Genres[key];
        if (lineBreak == 1) {
            check.style.cssText = "float: right;";
            text.style.cssText = "float: right;";

        }

        var checkNode = document.createTextNode(Genres[key]);
        text.appendChild(checkNode);
        var checkList = document.getElementById("genresCheck");
        checkList.appendChild(check);
        checkList.appendChild(text);
        lineBreak++;
        if (lineBreak == 2) {
            checkList.appendChild(addLineBreak());
            lineBreak = 0;
        }
    }
    
}

function switchFilterState() {
    if (filterState == false) {
        var form = document.getElementById("filterForm");
        form.style.display = "block";


        filterState = true;
    } else {
        var form = document.getElementById("filterForm");
        form.style.display = "none";
        filterState = false;
    }
}

function generateBooks(bookData) {
    Array.prototype.toString = function () {
        return this.join(', ');
    };
    const response = JSON.parse(bookData);
    books = response.books;
    let bookCount = 1;
    var element = document.getElementById("main");
    var surroundDiv = document.createElement("div");
    surroundDiv.id = "booksDiv";
    element.appendChild(surroundDiv);
    
    if (isEmpty(books)) {
        var noneFound = document.createElement("h2");
        var text = document.createTextNode("No books were found :(");
        noneFound.style.cssText = "color: white; margin-left: 25px;";
        noneFound.appendChild(text);
        surroundDiv.appendChild(noneFound);
        surroundDiv.appendChild(addLineBreak());
    }
    for (var key in books) {
        
        let name = key;
        let rating = books[key]["rating"];
        let genre = books[key]["genres"];

        let pages = books[key]["pages"];
        let synopsis = books[key]["synopsis"];
        let chapters = books[key]["chapters"];
        let bookmarked = books[key]["bookmarked"];
        let note = books[key]["note"]; 
        //Create Div
        const div = document.createElement("div");
        
        if (bookCount % 2 == 0) {
            div.classList.add("bookDivs");
            // div.style.cssText = 'margin-left:50px; margin-right:50px; border:2px solid; width:100%; border-color:#9b9bed;border-radius: 15px;padding:10px;background-color:#dae8ed';
        } else {
            div.classList.add("bookDiv2");
            // div.style.cssText = 'margin-left:50px; margin-right:50px; border:2px solid; width:100%; border-color:#9b9bed;border-radius: 15px;padding:10px;background-color:#acd1ee';
        }

        // book number 
        var bookNum = document.createElement("b");
        var numNode = document.createTextNode("#" + bookCount);
        bookNum.appendChild(numNode);
        div.appendChild(bookNum);
        //div.appendChild(addLineBreak());

        // bookmark button
        var button = document.createElement("button");
        button.innerHTML ='<i class="fa-solid fa-bookmark"></i>';
       
        button.style.cssText = "color: grey; font-size: 20px;  border: none; border-radius: 10px;";
        if (bookmarked) {
            button.style.color = "green";
        } else {
            button.onclick = function () { bookmarkBook(name); };
        }
        if (bookCount % 2 == 0) {
            button.style.backgroundColor =  "#dae8ed";
        } else {
            button.style.backgroundColor = "#acd1ee";
        }
        //console.log("books[key]:", books[key]);
       
            
       
        //button.appendChild(buttonText);
        div.appendChild(button);

        // book title
        var title = document.createElement("h2");
        var titleNode = document.createTextNode(name);
        title.appendChild(titleNode);
        div.appendChild(title);
        div.appendChild(addLineBreak());

        // book rating
        var ratingText = document.createElement("p");
        var rateNode = document.createTextNode("Rating: " + rating);
        ratingText.appendChild(rateNode);
        div.appendChild(ratingText);


        // book pages
        var pagesText = document.createElement("p");
        var pageNode = document.createTextNode(pages + " pages");
        pagesText.appendChild(pageNode);
        div.appendChild(pagesText);


        // book chapters
        var chapterText = document.createElement("p");
        var chapNode = document.createTextNode("chapters: " + chapters);
        chapterText.appendChild(chapNode);
        div.appendChild(chapterText);

        // book genres
        var genresText = document.createElement("b");
        var genreNode = document.createTextNode("genres: " + genre);
        genresText.appendChild(genreNode);
        div.appendChild(genresText);

        // book synopsis
        var synopsisText = document.createElement("p");
        var synoNode = document.createTextNode(htmlDecode(synopsis));
        synopsisText.appendChild(synoNode);
        div.appendChild(synopsisText);

        // book button
        var button = document.createElement("button");
        var buttonText = document.createTextNode("complete");
        button.onclick = function () { completeBook(name); };
        button.style.cssText = "background-color: #4CAF50; color:white; padding: 10px; padding-top:5px; padding-bottom:5px; border: none; border-radius: 10px;";
        button.appendChild(buttonText);
        div.appendChild(button);


        // show note if it exists
        if (note && note.trim() !== "") {
            var noteLabel = document.createElement("h4");
            noteLabel.textContent = "Note / Review:";
            noteLabel.style.marginTop = "15px";
            div.appendChild(noteLabel);

            var noteText = document.createElement("p");
            noteText.textContent = note;
            noteText.style.cssText = "background-color: #f0f0f0; padding: 10px; border-radius: 8px; white-space: pre-wrap;";
            div.appendChild(noteText);
        } else {
            // note/review textarea
            let noteInput = document.createElement("textarea");
            noteInput.placeholder = "Add a note or review...";
            noteInput.rows = 3;
            noteInput.style.cssText = "display: block; width: 100%; margin-top: 10px; border-radius: 8px; padding: 8px; border: 1px solid #ccc;";
            div.appendChild(noteInput);

            // submit note button
            let noteButton = document.createElement("button");
            noteButton.textContent = "Submit Note";
            noteButton.style.cssText = "margin-top: 5px; background-color: #2196F3; color: white; padding: 8px 12px; border: none; border-radius: 8px;";
            noteButton.onclick = function () {
                var note = noteInput.value.trim();
                if (note) {
                    submitNote(name, note); // assume this is your custom function
                    noteInput.value = ""; // clear input
                } else {
                    alert("Please enter a note before submitting.");
                }
            }
        div.appendChild(noteButton);
        }
       
        surroundDiv.appendChild(div);
        bookCount++;
    }
    // document.getElementById("test1").innerHTML = (bookData);

}

function submitNote(bookName, note) {
     var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/addNote/", false);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({
        "book": bookName,
        "notestr": note
    }));
    reloadWithLastFilters();
    return xhttp.responseText;
}

function isEmpty(obj) {
    for (const prop in obj) {
      if (Object.hasOwn(obj, prop)) {
        return false;
      }
    }
  
    return true;
  }

function addLineBreak() {
    const lineBreak = document.createElement("br");
    return lineBreak;
}

function bookRead(bookName) {

    let currentButton = document.getElementById(bookName);

    if (currentButton.textContent == "uncompleted") {
        currentButton.style.backgroundColor = "#4f4f95";
        currentButton.textContent = "completed";
        localStorage.setItem("bookTitle", bookName);
        booksData.push(bookName);
    } else if (currentButton.textContent == "completed") {
        currentButton.style.backgroundColor = "#8181f4";
        currentButton.textContent = "uncompleted";
        let index = booksData.indexOf(bookName);
        if (index > -1) {
            booksData.splice(index, 1);
        }
    }
    // Code for localStorage/sessionStorage.

}
function formatData(data) {
    returnText = data;
    for (let i = 0; i < booksData.length; i++) {
        returnText += "\n" + booksData[i];
    }
    return returnText;
}

function reloadWithLastFilters() {
    const filters = JSON.parse(sessionStorage.getItem("lastFilters"));
    if (filters) {
        loadFilterBooks(
            filters.genre,
            filters.pages,
            filters.rating,
            filters.read,
            filters.sort_by,
            filters.sort_order,
            filters.bookmarked
        );
    } else {
        loadFilterBooks(); 
    }
}

// Function to download data to a file
function download() {
    // let data = document.getElementById('hiddenSave').textContent + booksData;
    let data = formatData(document.getElementById('hiddenSave').textContent);
    let filename = "saveData";
    let type = ".txt";
    var file = new Blob([data], { type: type });
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}