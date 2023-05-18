// DOM elements
const searchForm = document.getElementById('search-form');
const artistInput = document.getElementById('artist-input');
const albumsDisplay = document.getElementById('albums-display');
const bioDisplay = document.getElementById('bio-display');
const artistName  = document.getElementById('artist-name')
const imageDisplay = document.getElementById('image-display');
// Event listener for form submission IE main section here
searchForm.addEventListener('submit', function(event) {
  event.preventDefault();
  artistName.textContent = artistInput.value;
  // Get the entered artist name
  const artist = artistInput.value;
// Save the search to local storage
 saveSearchToLocalStorage(artist);
 // Retrieve search history from local storage
const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
// Display search history on the page
const searchHistoryDisplay = document.getElementById('search-history-display');
searchHistoryDisplay.innerHTML = '';
searchHistory.forEach(function(searchTerm) {
  const searchTermElement = document.createElement('div');
  searchTermElement.classList.add('search-term');
  searchTermElement.textContent = searchTerm;
  searchHistoryDisplay.insertBefore(searchTermElement, searchHistoryDisplay.firstChild);
  if (searchHistoryDisplay.children.length > 5) {
    searchHistoryDisplay.lastChild.remove();
  }
});
  // Fetch artist ID from MusiXMatch API
  getArtistID(artist)
    .then(function(artistID) {
      // Fetch artist albums using the artist ID
      return getArtistAlbums(artistID);
    })
    .then(function(albums) {
      // Display the top 3 albums on the page
      displayAlbums(albums);
    })
    .catch(function(error) {
      console.log(error);
    });
  // Fetch artist biography from Wikipedia API
  getArtistBiography(artist)
    .then(function(biography) {
      // Display the biography on the page
      displayBiography(biography);
    })
    .catch(function(error) {
      console.log(error);
    });
  getArtistImage(artist)
     .then(function(imageSource){
      displayImage(imageSource);
     })
     .catch (function(error){
      console.log(error);
     });
  // Reset the input field
  artistInput.value = '';
});
// Function to save search to local storage
function saveSearchToLocalStorage(search) {
 const searchHistory = getSearchHistoryFromLocalStorage();
 searchHistory.push(search);
 localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
}
// Function to fetch artist ID from MusiXMatch API
async function getArtistID(artist) {
 const lastfmAPIKey = 'e8e8a3939846f3c18e37544d8148191d'; // Replace with your Last.fm API key
 // Make the API call to Last.fm API to get the artist ID
 const response = await fetch(`https://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${encodeURIComponent(artist)}&api_key=${lastfmAPIKey}&format=json`);
 if (response.ok) {
   const data = await response.json();
   const artistID = data.results.artistmatches.artist[0].mbid;
   return artistID;
 } else {
   throw new Error('Error fetching artist ID');
 }
}
// Function to fetch artist albums in order of popularity
async function getArtistAlbums(artistID) {
 const lastfmAPIKey = 'e8e8a3939846f3c18e37544d8148191d'; // Replace with your Last.fm API key
 // Make the API call to Last.fm API to get the artist's albums
 const response = await fetch(`https://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&mbid=${artistID}&limit=5&api_key=${lastfmAPIKey}&format=json`);
 if (response.ok) {
   const data = await response.json();
   const albums = data.topalbums.album.map(album => album.name);
   return albums;
 } else {
   throw new Error('Error fetching artist albums');
 }
}
// Function to fetch artist biography from Wikipedia API
async function getArtistBiography(artist) {
  // Make the API call to Wikipedia API
  const response = await fetch(`https://en.wikipedia.org/w/api.php?origin=*&action=query&format=json&prop=extracts&exintro=true&redirects=true&titles=${encodeURIComponent(artist)}`);
  if (response.ok) {
    const data = await response.json();
    const pages = data.query.pages;
    const pageIds = Object.keys(pages);
    const biography = pages[pageIds[0]].extract;
    return biography;
  } else {
    throw new Error('Error fetching artist biography');
  }
}
  //display section from here on
// Function to display artist albums on the page
function displayAlbums(albums) {
 albumsDisplay.innerHTML = '';
 albums.forEach(function(album) {
   const albumElement = document.createElement('div');
   albumElement.classList.add('album');
   albumElement.textContent = album; // Change 'album.album_name' to 'album'
   albumsDisplay.appendChild(albumElement);
 });
}
// Function to display artist biography on the page
function displayBiography(biography) {
  bioDisplay.innerHTML = biography;
}
//Function to display image on the page
function displayImage(imageSource) {
  imageDisplay.innerHTML = '';
  const imageEl = document.createElement('img');
  imageEl.src = imageSource;
  imageDisplay.appendChild(imageEl);
 }
 //Function to fetch artist image from Wiki API
 async function getArtistImage(artist) {
  const response = await fetch('https://en.wikipedia.org/w/api.php?origin=*&action=query&prop=pageimages&titles=' + artist +'&format=json&piprop=original');
  imageDisplay.innerHTML = '';
  if (response.ok) {
    const data = await response.json();
    const pages = data.query.pages;
    const pageIds = Object.keys(pages);
    const imageSource = pages[pageIds].original.source;
    console.log(imageSource);
    return imageSource;
  } else {
    throw new Error('Error fetching artist image');
  }
}
// Function to get search history from local storage
function getSearchHistoryFromLocalStorage() {
 let searchHistory = [];
 const searchHistoryString = localStorage.getItem('searchHistory');
 if (searchHistoryString) {
   searchHistory = JSON.parse(searchHistoryString);
 }
 return searchHistory;
}