document.addEventListener("DOMContentLoaded", bookHandler);

const input = document.getElementById("input");
const button = document.getElementById("button");
const noContent = document.getElementById("no-content");
const container = document.getElementById("container");
const prevBtn = document.getElementById("prevbtn");
const nextBtn = document.getElementById("nextbtn");
const toggleBtn = document.getElementById("toggleBtn");

let currentIndex = 1;
let itemsPerPage = 3;
let neededDatas = [];
let booksMaintain = [];
let isGrid = true;

async function bookHandler() {
  const url = "https://api.freeapi.app/api/v1/public/books";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Data is not available");
    }

    const result = await response.json();
    neededDatas = result.data.data
      .map((data) => ({
        title: data.volumeInfo.title,
        authors: data.volumeInfo.authors,
        publisher: data.volumeInfo.publisher,
        publishedDate: data.volumeInfo.publishedDate,
        thumbnail: data.volumeInfo.imageLinks?.smallThumbnail || "",
        infoLink: data.volumeInfo.infoLink,
      }))
      .sort((a, b) => {
        const titleCompare = a.title.localeCompare(b.title);
        if (titleCompare !== 0) return titleCompare;
        return new Date(a.publishedDate) - new Date(b.publishedDate);
      });

    booksMaintain = neededDatas.map(
      (data) =>
        `<div class="books" data-title="${data.title}" data-authors="${data.authors}">
          <a href=${data.infoLink}>
            <img src=${data.thumbnail} alt="${data.title}">
          </a>
           <div class="book-details"">
          <h3><strong>Title:</strong> ${data.title}</h3>
          <p><strong>Author:</strong> ${data.authors}</p>
          <p><strong>Publisher:</strong> ${data.publisher}</p>
          <p><strong>Published-Date:</strong> ${data.publishedDate}</p>
        </div></div>`
    );

    container.innerHTML = booksMaintain.join("");
    renderBook();
  } catch (error) {
    console.error("Sorry, data not fetched", error);
  }
}

// Toggle between Grid and List view
function toggleView() {
  isGrid = !isGrid;
  updateLayout();
}

// Update the layout based on view type
function updateLayout() {
  if (isGrid) {
    container.classList.add("book-cards");
    container.classList.remove("list-view");
    toggleBtn.textContent = "Switch to List View";
  } else {
    container.classList.add("list-view");
    container.classList.remove("book-cards");
    toggleBtn.textContent = "Switch to Grid View";
  }
}

// Render books based on pagination
function renderBook() {
  const books = document.querySelectorAll(".books");
  const start = (currentIndex - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  books.forEach((book) => (book.style.display = "none"));
  [...books].slice(start, end).forEach((book) => (book.style.display = "block"));

  paginationBtn();
}

// Pagination: Next Page
function nextPage() {
  if (currentIndex * itemsPerPage < neededDatas.length) {
    currentIndex++;
    renderBook();
  }
}

// Pagination: Previous Page
function prevPage() {
  if (currentIndex > 1) {
    currentIndex--;
    renderBook();
  }
}

// Enable/Disable Pagination Buttons
function paginationBtn() {
  prevBtn.disabled = currentIndex === 1;
  nextBtn.disabled = currentIndex * itemsPerPage >= neededDatas.length;
}

noContent.style.display = "none";

// Search Functionality
input.addEventListener("input", () => {
  const searchQuery = input.value.toLowerCase().replace(/\s+/g, "");
  const words = searchQuery.split(" ").filter((word) => word.length > 0);
  let hasMatch = false;

  const books = document.querySelectorAll(".books");
  books.forEach((data) => {
    const title = data.dataset.title.toLowerCase().replace(/\s+/g, "");
    const authors = data.dataset.authors.toLowerCase().replace(/\s+/g, "");

    const isMatch = words.every((word) => title.startsWith(word) || authors.startsWith(word));
    data.style.display = isMatch ? "block" : "none";
    hasMatch ||= isMatch;
  });

  if (searchQuery === "") {
    books.forEach((data, index) => {
      data.style.display = index < itemsPerPage ? "block" : "none";
    });
  }
  noContent.style.display = hasMatch ? "none" : "block";
});

// Add event listeners
nextBtn.addEventListener("click", nextPage);
prevBtn.addEventListener("click", prevPage);
toggleBtn.addEventListener("click", toggleView);
