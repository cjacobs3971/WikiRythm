 // DOM elements
 const searchForm = document.getElementById('search-form');
 const artistInput = document.getElementById('artist-input');
 const albumsDisplay = document.getElementById('albums-display');
 const bioDisplay = document.getElementById('bio-display');
 const artistName  = document.getElementById('artist-name')

 // Event listener for form submission IE main section here
 searchForm.addEventListener('submit', function(event) {
   event.preventDefault();
   artistName.textContent = artistInput.value;
   // Get the entered artist name
   const artist = artistInput.value;
   
     // Save the search to local storage
  saveSearchToLocalStorage(artist);

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
   const musixmatchAPIKey = 'fceac98815fa8bde7e61e39fc83387ae'; // Replace with your MusiXMatch API key
   console.log(artistInput.value, "1");
   // Make the API call to MusiXMatch API to get the artist ID
   const response = await fetch(`https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/artist.search?q_artist=${artistInput.value}&apikey=${musixmatchAPIKey}`);
   if (response.ok) {
     const data = await response.json();
     const artistID = data.message.body.artist_list[0].artist.artist_id;

     return artistID;
   } else {
     throw new Error('Error fetching artist ID');
   }
 }

 // Function to fetch artist albums from MusiXMatch API
 async function getArtistAlbums(artistID) {
   const musixmatchAPIKey = 'fceac98815fa8bde7e61e39fc83387ae';

   // Make the API call to MusiXMatch API to get the artist albums
   const response = await fetch(`https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/artist.albums.get?artist_id=${artistID}&s_release_date=desc&g_album_name=1&page_size=3&apikey=${musixmatchAPIKey}`);
   
   if (response.ok) {
     const data = await response.json();
     const albums = data.message.body.album_list.map(album => album.album);

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
     albumElement.textContent = album.album_name;
     albumsDisplay.appendChild(albumElement);
   });
 }

 // Function to display artist biography on the page
 function displayBiography(biography) {
   bioDisplay.textContent = biography;
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

// Retrieve search history from local storage
const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

// Display search history on the page
const searchHistoryDisplay = document.getElementById('search-history-display');
searchHistoryDisplay.innerHTML = '';
searchHistory.forEach(function(searchTerm) {
  const searchTermElement = document.createElement('div');
  searchTermElement.classList.add('search-term');
  searchTermElement.textContent = searchTerm;
  searchHistoryDisplay.appendChild(searchTermElement);
});