// Function to search movies using OMDb API
function searchMovies() {
  const searchTerm = document.getElementById("searchInput").value.trim();

  if (searchTerm === "") {
    alert("Please enter a search term."); // Alert if search term is empty
    return;
  }

  // API endpoint and API key (replace 'YOUR_API_KEY' with your actual API key)
  const apiUrl = `https://www.omdbapi.com/?s=${searchTerm}&apikey=b0c7d1b2`;

  // Fetch data from the API
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data.Response === "True") {
        const movies = data.Search;
        console.log(movies);
        displayMovies(movies); // Display movies if API response is successful
      } else {
        alert(data.Error); // Alert if API response is not successful
      }
    })
    .catch((error) => {
      console.log(error); // Log any errors
    });
}

// Event listener for search button click
document.getElementById("searchButton").addEventListener("click", searchMovies);

// Function to display movies
function displayMovies(movies) {
  const movieCatalog = document.getElementById("movieCatalog");
  movieCatalog.innerHTML = "";

  movies.forEach((movie) => {
    const card = document.createElement("div");
    card.classList.add("col-md-4");

    card.innerHTML = `
            <div class="card" data-title="${movie.Title}">
                <img src="${movie.Poster}" class="card-img-top" alt="${movie.Title}">
                <div class="card-body">
                    <h5 class="card-title">${movie.Title} (${movie.Year})</h5>
                    <a class="card-text" href="https://www.imdb.com/title/${movie.imdbID}/" target="_blank">IMDB</a>
                </div>
            </div>
        `;

    card.addEventListener("click", () => {
      openDialog(movie.Title);
    });

    movieCatalog.appendChild(card);
  });
}

// Function to open dialog with movie title
function openDialog(title) {
  console.log("Open dialog for:", title);
  const torrentSearch = `http://localhost:3001/api/yts/${title}`;

  // Fetch data from the API
  fetch(torrentSearch)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Data from API:", data);
      const magnetLink = data[0].Files[1].Magnet; // Assuming this is your magnet link
      console.log("Magnet link:", magnetLink);

      // Check if WebRTC is supported
      if (!WebTorrent.WEBRTC_SUPPORT) {
        console.error("WebRTC is not supported in this browser.");
        return;
      }

      // Use WebTorrent to handle the torrent
      const client = new WebTorrent();
      client.add(magnetLink, function (torrent) {
        console.log("Torrent info:", torrent);

        const file = torrent.files.find((file) => file.name.endsWith(".mp4"));

        if (!file) {
          console.error("No MP4 file found in the torrent.");
          return;
        }

        console.log("Rendering file:", file);

        const video = document.createElement("video");
        video.controls = true;
        file.renderTo(video, { autoplay: true }, function (err, elem) {
          if (err) {
            console.error("Error rendering video:", err);
          }
        });

        const modalBody = document.querySelector(".modal-body");
        modalBody.innerHTML = ""; // Clearing modal body
        modalBody.appendChild(video); // Appending video element
      });
    })
    .catch((error) => {
      console.error("Error fetching data:", error.message);
    });

  const modal = `
        <div class="modal fade" id="movieModal" tabindex="-1" aria-labelledby="movieModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="movieModalLabel">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                      
                    </div>
                </div>
            </div>
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", modal);

  // Show modal using jQuery
  $("#movieModal").modal("show");
}

// Function to toggle between dark and light mode
function toggleMode() {
  document.body.classList.toggle("dark-mode");
  document.body.classList.toggle("light-mode");
  updateIcon();
}

// Function to update icon based on mode
function updateIcon() {
  const modeIcon = document.getElementById("modeIcon");
  if (document.body.classList.contains("dark-mode")) {
    modeIcon.textContent = "brightness_3"; // Moon icon for dark mode
  } else {
    modeIcon.textContent = "wb_sunny"; // Sun icon for light mode
  }
}

// Event listener for mode button click
document.getElementById("modeBtn").addEventListener("click", toggleMode);

// Function to set initial mode based on user preference
function setInitialMode() {
  const prefersDarkMode = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  if (prefersDarkMode) {
    toggleMode();
  }
}

// Call the function to set initial mode
setInitialMode();
