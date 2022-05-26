import { useEffect, useState, useLayoutEffect} from 'react'; // use effect -> after render, do something 
import './App.css';
import axios from 'axios';

function App() {

  // spotify constants
  const CLIENT_ID = "XXXXXXXXXXX"
  const REDIRECT_URI = "http://localhost:3000"
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"

  const [token, setToken] = useState("") // state variable used to hold spotify token
  const [selectedPlaylistID, setSelectedPlaylistID] = useState("") // state variable used to hold spotify token
  const [selectedPlaylist, setSelectedPlaylist] = useState([]) // state variable used to hold spotify token

  const [width, setWidth] = useState(window.innerWidth);
  const [currentSongNameToClean, setCurrentSongNameToClean] = useState("");
  const [currentSongItem, setCurrentSongItem] = useState({});
  const [newCleanPlaylist, setNewCleanPlaylist] = useState([]) // state variable used to hold spotify token
  const [currentSongExplicit, setCurrentSongExplicit] = useState(false);

  useLayoutEffect(() => {
    const interval = setInterval(() => {
      setNewCleanPlaylist((newCleanPlaylist) => newCleanPlaylist.concat({}).filter(value => Object.keys(value).length !== 0))
      console.log('this is the newCleanPlaylist' + JSON.stringify(newCleanPlaylist))
    }, 2000);
  
    return () => clearInterval(interval);
  }, []);

  // check if on mobile, or not
  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, [width]);

  const isMobile = width <= 768;

  // used for fetching
  const [playlists, setPlaylists] = useState([])

  const searchPlaylists = async (e) => {
    e.preventDefault()
    const { data } = await axios.get("https://api.spotify.com/v1/me/playlists", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        // no params
      }
    })

    setPlaylists(data.items) // gets all plalists, and puts them in the constant "playlists"
  }

  // occurs every time a state variable changes
  useEffect(() => {
    const hash = window.location.hash
    let token = window.localStorage.getItem("token")

    // check we have hash or a token saved in localStorage
    if (!token && hash) {

      // if there is a token, set the token state variable
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

      // check if we have a hash; if there is hash, perform tasks on string to extract token
      window.location.hash = ""
      window.localStorage.setItem("token", token)

    }

    // check if there is a value saved
    setToken(token)
  }, [token])

  useLayoutEffect(() => {

    async function getSongs() {
      const { data } = await axios.get("https://api.spotify.com/v1/playlists/" + selectedPlaylistID, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {

        }
      })

      setSelectedPlaylist(data.tracks.items) // gets all songs from the playlist, and puts them into it      
      
      function addCleanSongs(trackName, track, explicit) {
        setCurrentSongNameToClean(trackName)
        setCurrentSongItem(track)
        console.log("The Track name is " + trackName)
        explicit ? setCurrentSongExplicit(true) : setCurrentSongExplicit(false)
        addNewClean(trackName, track, explicit);
      }

      selectedPlaylist.map(SP => (addCleanSongs(SP.track.name, SP.track, SP.track.explicit)))
      setNewCleanPlaylist([])
    }

    function addNewClean(trackName, track, explicit) {
      async function searchForClean() {
        const { data } = await axios.get("https://api.spotify.com/v1/search", {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            q: trackName + " clean",
            type: 'track',
            limit: 1
          }
        })

        setNewCleanPlaylist((newCleanPlaylist) => newCleanPlaylist.concat(data.tracks.items[0]).filter(value => Object.keys(value).length !== 0))

        console.log("data items:" + data.tracks.items[0])
      }

      console.log(newCleanPlaylist);
      explicit ? searchForClean() : setNewCleanPlaylist((newCleanPlaylist) => newCleanPlaylist.concat(track).filter(value => Object.keys(value).length !== 0))
    }

    console.log(selectedPlaylistID); 
    console.log(selectedPlaylist);
    getSongs();
  }, [selectedPlaylistID, token])

  // removes token from local storage, and sets state token back to empty string
  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
  }

  const renderPlaylists = () => {
    return playlists.map(playlist => (
      <div key={playlist.id} className="pl-container" onClick={() => setSelectedPlaylistID(playlist.id)}>
        <div className="playlist-box">
          <div className="pl-img">{playlist.images[0].width ? <img width={"100%"} src={playlist.images[0].url} alt="" /> : <div>No Image</div>}</div>
          <div className="pl-content">
            <h1>{playlist.name}</h1>
            <p>
              {playlist.owner.display_name} and {playlist.owner.external_urls.spotify}
            </p>
          </div>
        </div>
      </div>
    ))
  }

  const renderSongs = () => {
    return selectedPlaylist?.map(SP => (
      <div key={SP.id} className={SP.track.explicit ? "song-box explicit" : 'song-box'} >
        <div className='song-img'>{SP.track.album.images[0].width ? <img width={"100%"} src={SP.track.album.images[0].url} alt="" /> : <div>No Image</div>}</div>
        <div className="song-content">
          <p>
            {SP.track.name} &nbsp;
            {SP.track.explicit ? <i className="material-icons" style={{ fontSize: '20px' }}>explicit</i> : null} &nbsp;
          </p>
        </div>
        <br />
      </div>

    ))
  }

  const renderCleanSongs = () => {

    console.log("the new clean playlist is " + JSON.stringify(newCleanPlaylist))
    return newCleanPlaylist?.map(CS => (
      <div key={CS.id} className={CS.explicit ? "song-box explicit" : 'song-box'}>
        <div className="song-img">{CS.album.images[0].width ? <img width={"100%"} src={CS.album.images[0].url} alt="" /> : <div>No Image</div>}</div>
        <div className="song-content">
          <p>{CS.name}</p>
          {CS.explicit ? <i className="material-icons" style={{ fontSize: '20px' }}>explicit</i> : null} &nbsp;
        </div>
      </div>
    ))
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="title">Soapify</h1>


        {!token ?
          <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`} className="button">login to spotify</a>
          :
          <>
            <div>
              <button type="submit" onClick={(e) => searchPlaylists(e)}><span>get playlists</span></button>
              <button onClick={logout} className="button">logout</button>
            </div>

            {renderPlaylists()}
            {isMobile ?
              <>
                <h2>Non-Explicit</h2>{renderCleanSongs()}<br />
                <br />
                <h2>Original</h2> <br />  {renderSongs()}
              </>
              :
              <div class="pl-compare-container">
                <div style={{ float: 'right' }}><h2>Original</h2> <br /> {renderSongs()}</div>
                <div style={{ float: 'right' }}><h2>Non-Explicit</h2> <br />{renderCleanSongs()}</div>
              </div>
            }
          </>
        }
      </header>
    </div>
  );
}

export default App;
