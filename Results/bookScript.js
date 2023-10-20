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
    xhttp.open("GET", "http://127.0.0.1:8000/getBooks", false);
    // xhttp.setRequestHeader("Access-Control-Allow-Origin", "*");
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
    // console.log(inputs);
    console.log("pages: " + document.getElementById("pagesInput").value);
    console.log(results);
    console.log("rating: " + document.getElementById("ratingInput").value)
    console.log("completed: " + document.getElementById("completedId").value)
    var completedValue;
    if (document.getElementById("completedId").value == "yes") {
        completedValue = true;
    } else {
        completedValue = false;
    }
    loadFilterBooks(results, document.getElementById("pagesInput").value, document.getElementById("ratingInput").value, completedValue);
}

function loadFilterBooks(genres = [], pages = 0, rating = 0, read = false) {
    if (rating == "") {
        rating = 0;
    }
    if (pages == "") {
        pages = 0;
    }
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "http://127.0.0.1:8000/getFilterBooks/", false);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({ "genre": genres, "pages": pages, "rating": rating, "read": read }));
    var currentBooks = document.getElementById("booksDiv");
    currentBooks.remove();
    generateBooks(xhttp.responseText);
    // location.reload();
    return xhttp.responseText;
}

function completeBook(bookName) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "http://127.0.0.1:8000/completeBook/", false);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({ "book": bookName }));
    // console.log({"book": bookName});
    // generateBooks(xhttp.responseText);
    location.reload();
    return xhttp.responseText;
}

function genFilterTab() {

    var form = document.getElementById("filterForm");
    form.style.display = "none";

    lineBreak = 0;
    // rating: <input type="text"></input> <br></br>
    // rating label for filter
    var ratingInput = document.createElement("input");
    ratingInput.type = "text";
    ratingInput.size = 5;
    ratingInput.id = "ratingInput";
    var ratingLabel = document.createElement("label");
    ratingLabel.appendChild(document.createTextNode("Rating"));
    form.appendChild(ratingLabel);
    form.appendChild(ratingInput);
    form.appendChild(addLineBreak());

    var pagesInput = document.createElement("input");
    pagesInput.type = "text";
    pagesInput.size = 5;
    pagesInput.id = "pagesInput";
    var pagesLabel = document.createElement("label");
    pagesLabel.appendChild(document.createTextNode("Pages"));
    form.appendChild(pagesLabel);
    form.appendChild(pagesInput);
    form.appendChild(addLineBreak());

    var completed = document.createElement("select");
    var completedLabel = document.createElement("label");
    completed.id = "completedId";

    var optionYes = document.createElement("option");
    optionYes.appendChild(document.createTextNode("Yes"));
    var optionNo = document.createElement("option");
    optionNo.appendChild(document.createTextNode("No"));

    completed.appendChild(optionYes);
    completed.appendChild(optionNo);
    completedLabel.appendChild(document.createTextNode("Include completed books"));
    form.appendChild(completedLabel);
    form.appendChild(completed);
    form.appendChild(addLineBreak());
    
    //<button onclick="getCheckedElements()" type="button">filter</button>
    var confirmButton = document.createElement("button");
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

        //Create Div
        const div = document.createElement("div");
        
        if (bookCount % 2 == 0) {
            div.style.cssText = 'margin-left:50px; margin-right:50px; border:2px solid; border-color:#9b9bed;border-radius: 15px;padding:10px;background-color:#dae8ed';
        } else {
            div.style.cssText = 'margin-left:50px; margin-right:50px; border:2px solid; border-color:#9b9bed;border-radius: 15px;padding:10px;background-color:#acd1ee';
        }

        // book number 
        var bookNum = document.createElement("b");
        var numNode = document.createTextNode("#" + bookCount);
        bookNum.appendChild(numNode);
        div.appendChild(bookNum);
        div.appendChild(addLineBreak());

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
        // var buttonNode = document.createTextNode(synopsis);

        div.appendChild(button);

       
        surroundDiv.appendChild(div);
        bookCount++;
    }
    // document.getElementById("test1").innerHTML = (bookData);

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