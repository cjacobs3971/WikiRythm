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
  const artist = artistInput.value.trim();
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
      displayAlbums(artist, albums);
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
 const response = await fetch(`https://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&mbid=${artistID}&limit=3&api_key=${lastfmAPIKey}&format=json`);
 if (response.ok) {
   const data = await response.json();
   const albums = data.topalbums.album.map(album => album.name);
   return albums;
 } else {
   throw new Error('Error fetching artist albums');
 }
}
// Function to fetch the top songs for an album
async function getAlbumSongs(artist, album) {
  const apiKey = 'e8e8a3939846f3c18e37544d8148191d';

  try {
    const response = await fetch(`https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${apiKey}&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&limit=3&format=json`);
    if (!response.ok) {
      throw new Error('Error fetching album songs');
    }
    const data = await response.json();
    const tracks = data.album.tracks.track;
    const songs = tracks.map(track => track.name);
    return songs;
  } catch (error) {
    throw new Error('Error fetching album songs');
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
// Call getAlbumSongs within the displayAlbums function
// Function to display artist albums on the page
// Function to display artist albums on the page
async function displayAlbums(artist, albums) {
  albumsDisplay.innerHTML = '';

  for (const album of albums) {
    const albumContainer = document.createElement('div');
    albumContainer.classList.add('album-container');

    const albumNameElement = document.createElement('div');
    albumNameElement.classList.add('album-name');
    albumNameElement.textContent = album;
    albumContainer.appendChild(albumNameElement);

    const songline = document.createElement('h1');
    songline.classList.add('song-line');
    songline.textContent = '5 Songs From Album';
    albumContainer.appendChild(songline);

    try {
      const songs = await getAlbumSongs(artist, album);

      const songsElement = document.createElement('ul');
      songsElement.classList.add('songs-list');
      songs.slice(0, 5).forEach(function (song) {
        const songElement = document.createElement('li');
        songElement.textContent = song;
        songsElement.appendChild(songElement);
      });
      albumContainer.appendChild(songsElement);
    } catch (error) {
      console.error(error);
    }

    albumsDisplay.appendChild(albumContainer);
  }
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
  const artistName = makeUpperCase(artist)
  const response = await fetch('https://en.wikipedia.org/w/api.php?origin=*&action=query&prop=pageimages&titles=' + artistName +'&format=json&piprop=original');
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
//Function to make the first letter of each word to uppercase
function makeUpperCase(str) {
  var splitStr = str.toLowerCase().split(' ');
  for (var i = 0; i < splitStr.length; i++) {
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
  }
  return splitStr.join(' '); 
}