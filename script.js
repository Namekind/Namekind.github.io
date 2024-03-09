const firebaseConfig = {
  apiKey: "AIzaSyBp_FJA7F41lSXZ2ynpejztXVCZhFyWSig",
  authDomain: "eversuse-46211.firebaseapp.com",
  databaseUrl:"https://eversuse-46211-default-rtdb.firebaseio.com/",
  projectId: "eversuse-46211",
  storageBucket: "eversuse-46211.appspot.com",
  messagingSenderId: "932580302128",
  appId: "1:932580302128:web:28a38f308a586ff31abcf5",
  measurementId: "G-D9NVQKD24D"
};
firebase.initializeApp(firebaseConfig);



const landingPage = {
  template: '#landingPage-template',
  created() {
    // Retrieve UserID from the global cookie
    const userId = this.getCookie('userId');
    console.log('UserID retrieved from cookie:', userId);

    if (userId) {
      // Check user login status
      this.checkLoginStatus(userId);
    }
    // If no UserID is found, allow the user to log in or sign up
  },
  methods: {
    checkLoginStatus(userId) {
      firebase.database().ref('Users/' + userId).once('value')
        .then(snapshot => {
          const userData = snapshot.val();
          if (userData && userData.logInStatus) {
            // If login status is true, route the user to the homepage
            this.$router.push({
              path: '/home',
              params: {
                userID: userId,
              },
            });
          }
          // If login status is false, allow the user to follow the due process of logging in
        })
        .catch(error => {
          console.error('Error checking login status:', error.message);
        });
    },
    getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    },
  },
};           
const LoginPage = {
  template: '#Login-template',
  data() {
    return {
      email: '',
      password: '',
      successMessage: '',
      errorMessage: '',
      message: ''
    };
  },
  methods: {
    loginUser() {
      // Use Firebase authentication method for email and password login
      firebase.auth().signInWithEmailAndPassword(this.email, this.password)
        .then((userCredential) => {
          // Save user login details to local storage cache
          const userData = {
            email: this.email,
            password: this.password, // Note: storing the password in plain text is not recommended in production apps
            userId: userCredential.user.uid, // Retrieve and cache the UserID
          };
          localStorage.setItem('userData', JSON.stringify(userData));

          // Update logInStatus in the Firebase Realtime Database to true
          firebase.database().ref('Users/' + userData.userId).update({ logInStatus: true });

          // Redirect to the homepage and pass user credentials
          this.$router.push({
            path: '/home',
            params: {
              email: this.email,
              userId: userData.userId, // Pass the UserID to the Homepage
            },
          });
        })
        .catch(error => {
          // Handle login errors here, you can display a message to the user
          console.error('Login Error:', error.message);
          this.errorMessage = true;
          this.successMessage = false;
          this.message = error.message;
          setTimeout(() => {
            this.clearMessages();
          }, 10000);
        });
    },
    clearMessages() {
      this.errorMessage = false;
      this.successMessage = false;
      this.message = '';
    }
  },
};
const SignUpPage = {
  template: '#SignUp-template',
  data() {
    return {
      email: '',
      password: '',
      successMessage: '',
      errorMessage: '',
      message: ''
    };
  },
  methods: {
    handleSignup() {
      // Use Firebase authentication method for email and password signup
      firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
        .then((userCredential) => {
          const userId = userCredential.user.uid;
          
          // Create a document in Firestore collection Users
          firebase.firestore().collection("Users").doc(this.email).set({
            password: this.password
          })
          .then(() => {
            console.log("Document successfully written!");
            
            // Redirect to login page and pass user credentials
            this.$router.push({
              path: '/login',
              params: {
                email: this.email,
                password: this.password,
              },
            });
          })
          .catch((error) => {
            console.error("Error writing document: ", error);
          });
        })
        .catch(error => {
          // Handle signup errors here, you can display a message to the user
          console.error('Signup Error:', error.message);
          this.errorMessage = true;
          this.successMessage = false;
          this.message = error.message;
          setTimeout(() => {
            this.clearMessages();
          }, 10000);
        });
    },
    clearMessages() {
      this.errorMessage = false;
      this.successMessage = false;
      this.message = '';
    }
  },
};
const PasswordPage = {
  template: '#Password-template',
  data() {
    return {
      email: '',
      successMessage: '',
      errorMessage: '',
      message: ''
    };
  },
  methods: {
    recoverPassword() {
      // Check if email is provided
      if (!this.email) {
        this.errorMessage = true;
        this.successMessage = false;
        this.message = 'Please provide your email.';
        return;
      }

      // Check Firestore collection Users for a document with Id that matches the email input
      firebase.firestore().collection("Users").doc(this.email).get()
        .then((doc) => {
          if (doc.exists) {
            // If document exists, trigger the Firebase password reset function
            firebase.auth().sendPasswordResetEmail(this.email)
              .then(() => {
                // Display success message
                this.errorMessage = false;
                this.successMessage = true;
                this.message = 'A Password Reset Email Will Be Sent To You Shortly.';
              })
              .catch((error) => {
                // Handle errors
                console.error('Password Reset Error:', error.message);
                this.errorMessage = true;
                this.successMessage = false;
                this.message = error.message;
              });
          } else {
            // If document does not exist, display error message
            this.errorMessage = true;
            this.successMessage = false;
            this.message = 'Email not found. Please provide a valid email address.';
          }
        })
        .catch((error) => {
          console.error('Error retrieving document:', error);
          this.errorMessage = true;
          this.successMessage = false;
          this.message = 'An error occurred. Please try again later.';
        });
    },
    clearMessages() {
      this.errorMessage = false;
      this.successMessage = false;
      this.message = '';
    }
  },
};
const SubscriptionPage = {
  template: '#Subscription-template',
  data() {
    return {
      passkey: '',
      userID: null,
    };
  },
  created() {
    // Retrieve UserID from the global cookie
    this.userID = this.getCookie('userId');
    console.log('UserID retrieved from cookie:', this.userID);

    // Check if the user is logged in
    this.checkLoginStatus();
  },
  methods: {
    checkLoginStatus() {
      firebase.database().ref('Users/' + this.userID).once('value')
        .then(snapshot => {
          const userData = snapshot.val();
          if (!userData || !userData.logInStatus) {
            // If login status is false or no user data found, route the user to the login page
            this.$router.push('/login');
          } else if (userData.subscriptionStatus) {
            // If subscription status is true, aggressively route the user back to the homepage
            this.$router.push('/home');
          }
        })
        .catch(error => {
          console.error('Error checking login status:', error.message);
        });
    },
    handlePasskeySubmission() {
  const wordsRef = firebase.database().ref('Words');
  wordsRef.once('value')
    .then(snapshot => {
      const wordsObj = snapshot.val();

      if (wordsObj) {
        const words = Object.values(wordsObj); // Convert object to array

        let matchingIndex = -1;

        // Check each entry in the Words array for a case-insensitive match
        words.forEach((word, index) => {
          if (word.toLowerCase() === this.passkey.toLowerCase()) {
            matchingIndex = index;
          }
        });

        if (matchingIndex === -1) {
          console.error('Invalid passkey. Please try again.');
        } else {
          const wordToRemove = Object.keys(wordsObj)[matchingIndex];
          wordsRef.child(wordToRemove).remove();

          firebase.database().ref('Users/' + this.userID).update({
            subscriptionStatus: true,
            subscriptionDuration: 30,
            subscriptionStartDateTime: firebase.database.ServerValue.TIMESTAMP,
          });

          this.$router.push({
            path: '/home',
            params: {
              userID: this.userID,
              additionalData: 'Your Additional Data',
            },
          });
        }
      } else {
        console.error('Words object is undefined.');
      }
    })
    .catch(error => {
      console.error('Error retrieving Words from the database:', error.message);
    });
},

    getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    },
    quitSubscription() {
      // Set the user login status to false in the real-time database
      firebase.database().ref('Users/' + this.userID).update({ logInStatus: false });

      // Log out the user
      firebase.auth().signOut().then(() => {
        // Redirect to the login page after logout
        this.$router.push('/login');
      }).catch(error => {
        console.error('Logout Error:', error.message);
      });
    },
  },
};
const HomePage = {
  template: '#home-template',
  data() {
    return {
      username: '',
      countdownTimer: '00:00:00', 
      videoLink: '',
      isLoading: true,
      videos: [],
      movies: [],
      tvSeries: [],
      bingeMovies: [],
      nollywoodMovies: [],
      cartoonsMovies: [],
      cacheExpiry: 24 * 60 * 60 * 1000, // Cache expiry set to 24 hours
      lastFetchTime: null,
      searchQuery: '',
      searchResults: [],
    };
  },
  created() {
            // Retrieve user credentials from URL or cache
    const userId = this.$route.params.userId || (localStorage.userData ? JSON.parse(localStorage.userData).userId : null);
    const email = this.$route.params.email || (localStorage.userData ? JSON.parse(localStorage.userData).email : null);

    if (userId && email) {
      // Display email as the username
      this.username = email;

      // Log the received userID from Login page
      console.log('Received UserID from Login Page:', userId);

      // Set UserID in the global cookie, overwriting any existing value
      document.cookie = `userId=${userId}; path=/`;

      // Check login status and subscription status in the real-time database
      this.checkUserStatus(userId);
    } else {
      // If UserID or email is not available, route the user to the login page
      this.$router.push('/login');
    }
    this.fetchVideos();
    this.fetchMovies();
    this.fetchTvSeries();
  },
  methods: {
    checkUserStatus(userId) {
      // Retrieve user data from the database using UserID as an identifier
      firebase.database().ref('Users/' + userId).once('value')
        .then(snapshot => {
          const userData = snapshot.val();

          if (userData && userData.logInStatus && userData.subscriptionStatus) {
            // Check and update countdown timer
            this.updateCountdownTimer(userData.subscriptionDuration, userData.subscriptionStartDateTime);
          } else if (!userData || !userData.logInStatus) {
            // If login status is false or no user data found, route the user to the login page
            this.$router.push('/login');
          } else if (!userData.subscriptionStatus) {
            // If subscription status is false, route the user to the subscription page
            this.$router.push({
              path: '/subscription',
              params: {
                userId: userId, // Send userId to the subscription page
              },
            });

            // Log the sent userID to Subscription page
            console.log('Sent UserID to Subscription Page:', userId);
          }
        })
        .catch(error => {
          console.error('Error retrieving user data:', error.message);
        });
    },
    updateCountdownTimer(subscriptionDuration, subscriptionStartDateTime) {
      // Calculate remaining time based on subscription details
      const currentDate = new Date();
      const startDate = new Date(subscriptionStartDateTime);
      const remainingTime = subscriptionDuration * 24 * 60 * 60 * 1000 - (currentDate - startDate);

      // Update countdown timer
      this.countdownTimer = this.formatTime(remainingTime);

      // Check if the subscription has expired
      if (remainingTime <= 0) {
        // Set the user subscription status to false
        const userId = firebase.auth().currentUser.uid;
        firebase.database().ref('Users/' + userId).update({ subscriptionStatus: false });

        // Aggressively route the user to the subscription page
        this.$router.push('/subscription');
      } else {
        // Schedule periodic timer updates
        setInterval(() => {
          this.updateCountdownTimer(subscriptionDuration, subscriptionStartDateTime);
        }, 1000);
      }
    },
    formatTime(milliseconds) {
      // Format milliseconds into HH:MM:SS
      const seconds = Math.floor(milliseconds / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      return `${this.pad(hours)}:${this.pad(minutes % 60)}:${this.pad(seconds % 60)}`;
    },
    pad(value) {
      // Add a leading zero if the value is less than 10
      return value < 10 ? '0' + value : value;
    },
    logoutUser() {
      // Set the user login status to false in the real-time database
      const userId = firebase.auth().currentUser.uid;
      firebase.database().ref('Users/' + userId).update({ logInStatus: false });

      // Log out the user
      firebase.auth().signOut().then(() => {
        // Redirect to the login page after logout
        this.$router.push('/login');
      }).catch(error => {
        console.error('Logout Error:', error.message);
      });
    },
    async fetchMovies() {
  const cachedData = this.getCachedMovies();
  if (cachedData && cachedData.timestamp && !this.isCacheExpired(cachedData.timestamp)) {
    this.movies = cachedData.movies;
    this.bingeMovies = cachedData.bingeMovies;
    this.nollywoodMovies = cachedData.nollywoodMovies;
    this.cartoonsMovies = cachedData.cartoonsMovies;
    console.log("Using cached movies data:", this.movies);
    console.log("Using cached binge movies data:", this.bingeMovies);
    console.log("Using cached Nollywood movies data:", this.nollywoodMovies);
    console.log("Using cached cartoons movies data:", this.cartoonsMovies);
  } else {
    if (cachedData && !cachedData.timestamp) {
      this.clearCachedMovies();
    }
    try {
      const firestore = firebase.firestore();
      const moviesSnapshot = await Promise.all([
        firestore.collection('Movies').get(),
        firestore.collection('Binge').get(),
        firestore.collection('Nollywood').get(),
        firestore.collection('Cartoons').get()
      ]);

      // Fetching fresh data from Firestore for each movie collection
      this.movies = moviesSnapshot[0].docs.map(doc => doc.data());
      this.bingeMovies = moviesSnapshot[1].docs.map(doc => doc.data());
      this.nollywoodMovies = moviesSnapshot[2].docs.map(doc => doc.data());
      this.cartoonsMovies = moviesSnapshot[3].docs.map(doc => doc.data());

      // Caching the fetched movies
      this.cacheMovies();
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  }
  // Shuffle the movies arrays
  this.shuffleMovies(this.movies);
  this.shuffleMovies(this.bingeMovies);
  this.shuffleMovies(this.nollywoodMovies);
  this.shuffleMovies(this.cartoonsMovies);
},
    async fetchTvSeries() {
      const cachedData = this.getCachedTvSeries();
      if (cachedData && cachedData.timestamp && !this.isCacheExpired(cachedData.timestamp)) {
        this.tvSeries = cachedData.tvSeries;
        console.log("Using cached TV series data:", this.tvSeries);
      } else {
        if (cachedData && !cachedData.timestamp) {
          this.clearCachedTvSeries();
        }
        try {
          const firestore = firebase.firestore();
          const seriesSnapshot = await firestore.collection('TV Series').get();
          this.tvSeries = seriesSnapshot.docs.map(doc => doc.data());
          // Caching the fetched TV series
          this.cacheTvSeries();
        } catch (error) {
          console.error("Error fetching TV series:", error);
        }
      }
      // Shuffle the TV series array
      this.shuffleSeries(this.tvSeries);
    },
    getCachedTvSeries() {
      // Retrieve TV series data and timestamp from localStorage
      const cachedData = localStorage.getItem('tvSeries');
      return cachedData ? JSON.parse(cachedData) : null;
    },
    isCacheExpired(timestamp) {
      // Check if cache is expired based on provided timestamp and cache expiry duration
      return Date.now() - timestamp > this.cacheExpiry;
    },
    clearCachedTvSeries() {
      // Clear cached TV series data from localStorage
      localStorage.removeItem('tvSeries');
      console.log("Cached TV series data without timestamp cleared.");
    },
    cacheTvSeries() {
      // Cache TV series data and timestamp in localStorage
      localStorage.setItem('tvSeries', JSON.stringify({ 
        tvSeries: this.tvSeries,
        timestamp: Date.now()
      }));
      console.log("TV series cached with timestamp:", Date.now());
    },
    getCachedMovies() {
      // Retrieve movies data and timestamp from localStorage
      const cachedData = localStorage.getItem('movies');
      return cachedData ? JSON.parse(cachedData) : null;
    },
    isCacheExpired(timestamp) {
      // Check if cache is expired based on provided timestamp and cache expiry duration
      return Date.now() - timestamp > this.cacheExpiry;
    },
    clearCachedMovies() {
      // Clear cached movies data from localStorage
      localStorage.removeItem('movies');
      console.log("Cached movies data without timestamp cleared.");
    },
    cacheMovies() {
      // Cache movies data and timestamp in localStorage
      localStorage.setItem('movies', JSON.stringify({ 
        movies: this.movies, 
        bingeMovies: this.bingeMovies, 
        nollywoodMovies: this.nollywoodMovies, 
        cartoonsMovies: this.cartoonsMovies,
        timestamp: Date.now()
      }));
      console.log("Movies cached with timestamp:", Date.now());
    },
handleSeriesCardClick(seriesTitle) {
  const series = this.tvSeries.find(series => series.title === seriesTitle);
  if (series) {
    this.populateSeriesModal(series);
    this.showSeriesModal();
  } else {
    console.error("Series not found:", seriesTitle);
  }
},
populateSeriesModal(series) {
  // Populate modal with series details
  const modalBody = document.querySelector('#seriesDetailsModal .modal-body');
  modalBody.innerHTML = `
    <div class="container">
      <div class="row">
        <div class="col-md-4">
          <img src="${series.posterUrl}" alt="${series.title}" class="img-fluid">
        </div>
        
          <button class="btn btn-secondary" id="seasonBtn">Seasons</button>
          <div id="seasonsSection" style="display: none;">
            <!-- Seasons will be populated here -->
          </div>
          <div id="episodesSection" style="display: none;">
            <!-- Episodes will be populated here -->
          </div>
        <div class="col-md-8">
          <h2>${series.title}</h2>
          <p>${series.tagline}</p>
          <p>${series.synopsis}</p>
          <p><strong>Genre:</strong> ${series.genre}</p>
          <p><strong>Network:</strong> ${series.network}</p>
          <p><strong>First Aired:</strong> ${series.firstAired}</p>
          <p><strong>Cast:</strong> ${series.cast}</p>
        </div>
      </div>
    </div>
  `;
  
  // Add event listener to the Seasons button
  const seasonBtn = modalBody.querySelector('#seasonBtn');
  seasonBtn.addEventListener('click', async () => {
    const seasonsSection = modalBody.querySelector('#seasonsSection');
    const episodesSection = modalBody.querySelector('#episodesSection');
    
    // Toggle visibility of season and episode sections
    if (seasonsSection.style.display === 'none') {
      seasonsSection.style.display = 'block';
      episodesSection.style.display = 'none';
      
      // Populate season section with season cards
      this.populateSeasons(seasonsSection, series.seasons);
    } else {
      seasonsSection.style.display = 'none';
      episodesSection.style.display = 'none';
    }
  });
},
populateSeasons(seasonsSection,seasons){
  seasonsSection.innerHTML = ''; // Clear previous content

  seasons.forEach((season, index) => {
    const seasonCard = document.createElement('div');
    seasonCard.classList.add('season-card');
    seasonCard.innerHTML = `
      <img src="${season.posterUrl}" alt="Season ${index + 1}" class="img-fluid">
      <p>Season ${index + 1}</p>
    `;

    seasonCard.addEventListener('click', () => {
      // Remove active class from previously clicked card
      const previouslyActiveCard = seasonsSection.querySelector('.season-card.active');
      if (previouslyActiveCard) {
        previouslyActiveCard.classList.remove('active');
      }

      // Add active class to the clicked card
      seasonCard.classList.add('active');

      console.log(`Clicked on Season ${index + 1}`);
      this.populateEpisodes(season);
    });

    seasonsSection.appendChild(seasonCard);
  });
},
showSeriesModal() {
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('seriesDetailsModal'));
  modal.show();
},
populateEpisodes(selectedSeason) {
  const episodesSection = document.querySelector('#episodesSection');
  episodesSection.innerHTML = ''; // Clear previous content

  const episodes = selectedSeason.episodes;

  episodes.forEach((episode, index) => {
    const episodeButton = document.createElement('button');
    episodeButton.classList.add('episode-button');
    episodeButton.textContent = `Episode ${index + 1}`;

    episodeButton.addEventListener('click', () => {
      console.log(`Episode ${index + 1} video link: ${episode.videoLink}`);
        // Populate video page modal with video iframe
        this.populateVideoPageModal(`${episode.videoLink}`);

        // Show video page modal
        this.showVideoPageModal();
      
      
      // You can optionally play the video using the retrieved link here
    });

    episodesSection.appendChild(episodeButton);
  });

  episodesSection.style.display = 'block'; // Show the episode section
},
shuffleSeries(seriesArray) {
      for (let i = seriesArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [seriesArray[i], seriesArray[j]] = [seriesArray[j], seriesArray[i]];
      }
    },
    shuffleMovies(moviesArray) {
      for (let i = moviesArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [moviesArray[i], moviesArray[j]] = [moviesArray[j], moviesArray[i]];
      }
    },
    displayRating(rating) {
      const fullStars = Math.floor(rating);
      const halfStar = rating % 1 >= 0.5 ? 1 : 0;
      const emptyStars = 5 - fullStars - halfStar;
      
      let starsHtml = '';
      for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star"></i>';
      }
      if (halfStar === 1) {
        starsHtml += '<i class="fas fa-star-half-alt"></i>';
      }
      for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="far fa-star"></i>';
      }
      
      return starsHtml;
    },
handleCardClick(movieTitle) {
  let movie = null;
  
  // Search for the movie in the 'Movies' collection
  movie = this.movies.find(movie => movie.title === movieTitle);
  if (movie) {
    this.populateModal(movie);
    this.showModal();
    return;
  }
  
  // Search for the movie in the 'Binge' collection
  movie = this.bingeMovies.find(movie => movie.title === movieTitle);
  if (movie) {
    this.populateModal(movie);
    this.showModal();
    return;
  }
  
  // Search for the movie in the 'Nollywood' collection
  movie = this.nollywoodMovies.find(movie => movie.title === movieTitle);
  if (movie) {
    this.populateModal(movie);
    this.showModal();
    return;
  }
  
  // Search for the movie in the 'Cartoons' collection
  movie = this.cartoonsMovies.find(movie => movie.title === movieTitle);
  if (movie) {
    this.populateModal(movie);
    this.showModal();
    return;
  }
  
  console.error("Movie not found in any collection:", movieTitle);
  const playButton = modalBody.querySelector('.play-button');
      playButton.addEventListener('click', () => {
        // Log video link to console
        this.videoLink = playButton.dataset.video;
        console.log('Video link:', this.videoLink);

        // Populate video page modal with video iframe
        this.populateVideoPageModal(this.videoLink);

        // Show video page modal
        this.showVideoPageModal();
      });
},
populateModal(movie) {
  // Populate modal with movie details
  const modalBody = document.querySelector('#movieDetailsModal .modal-body');
  modalBody.innerHTML = `
    <div class="container">
      <div class="row">
        <div class="col-md-4">
          <img src="${movie.posterUrl}" alt="${movie.title}" class="img-fluid">
          <!-- Play button -->
          <button class="play-button" data-video="${movie.videoLink}"><i class="fas fa-play"></i></button>
        </div>
        <div class="col-md-8">
          <h2>${movie.title}</h2>
          <p>${movie.tagline}</p>
          <p>${movie.synopsis}</p>
          <p>${movie.cast}</p>
          <p>${movie.genre}</p>
          <p><i class="fa-solid fa-flag-checkered" style="color: #ffffff;"></i> ${movie.rating}</p>
          <p><strong>Release Date:</strong> ${movie.releaseDate}</p>
          <!-- Add more details as needed -->
        </div>
      </div>
    </div>
  `;

// Add event listener to play button
      const playButton = modalBody.querySelector('.play-button');
      playButton.addEventListener('click', () => {
        // Log video link to console
        this.videoLink = playButton.dataset.video;
        console.log('Video link:', this.videoLink);

        // Populate video page modal with video iframe
        this.populateVideoPageModal(this.videoLink);

        // Show video page modal
        this.showVideoPageModal();
      });
},
showModal() {
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('movieDetailsModal'));
  modal.show();
},
    populateVideoPageModal(videoLink) {
      // Populate video page modal with video iframe
      const videoPageModalBody = document.querySelector('#videoPageModal .modal-body');
      videoPageModalBody.innerHTML = `
        <iframe alt="Please Wait For Video to Load!..."  src="${videoLink}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>
      `;
    },
    showVideoPageModal() {
      // Show video page modal
      const videoPageModal = new bootstrap.Modal(document.getElementById('videoPageModal'));
      videoPageModal.show();
    },
    clearVideoPageModal() {
      // Clear video link and content from video page modal
      this.videoLink = '';
      const videoPageModalBody = document.querySelector('#videoPageModal .modal-body');
      videoPageModalBody.innerHTML = '';
    },
    closeVideoPageModal() {
  // Clear video link and content, and close video page modal
  this.clearVideoPageModal();
  const videoPageModal = new bootstrap.Modal(document.getElementById('videoPageModal'));
  videoPageModal.hide();
  
  console.log("Video page modal is being hidden:", videoPageModal);
},

handleSearchClick() {
  // Retrieve cached data from local storage for Movies
  const moviesData = localStorage.getItem('movies');
  const moviesCache = moviesData ? JSON.parse(moviesData) : null;

  // Retrieve cached data from local storage for TV Series
  const tvSeriesData = localStorage.getItem('tvSeries');
  const tvSeriesCache = tvSeriesData ? JSON.parse(tvSeriesData) : null;

  // Initialize search results array
  let searchResults = [];

  // Search through movies cache
  if (moviesCache) {
    // Combine movies from different collections into one array
    const allMovies = [...moviesCache.movies, ...moviesCache.bingeMovies, ...moviesCache.nollywoodMovies, ...moviesCache.cartoonsMovies];
    allMovies.forEach(movie => {
      // Check if the title or document ID includes the search query
      if ((movie.title && movie.title.toLowerCase().includes(this.searchQuery.toLowerCase())) || movie.id === this.searchQuery.toLowerCase()) {
        searchResults.push({ collection: 'Movies', data: movie });
      }
    });
  }

  // Search through TV series cache
  if (tvSeriesCache) {
    tvSeriesCache.tvSeries.forEach(series => {
      // Check if the title or document ID includes the search query
      if ((series.title && series.title.toLowerCase().includes(this.searchQuery.toLowerCase())) || series.id === this.searchQuery.toLowerCase()) {
        searchResults.push({ collection: 'TV Series', data: series });
      }
    });
  }

  // Sort search results by the most closely matched before the least
  searchResults.sort((a, b) => {
    const titleA = a.data.title ? a.data.title.toLowerCase() : '';
    const titleB = b.data.title ? b.data.title.toLowerCase() : '';
    const queryLower = this.searchQuery.toLowerCase();
    const scoreA = titleA.split('').filter(char => queryLower.includes(char)).length;
    const scoreB = titleB.split('').filter(char => queryLower.includes(char)).length;
    return scoreB - scoreA; // Sort in descending order of similarity score
  });

  // Update searchResults property
  this.searchResults = searchResults;

  // Display search results
  console.log("Search results:", this.searchResults);
},
clearSearchResults() {
  // Clear search query
  this.searchQuery = '';

  // Clear search results
  this.searchResults = [];

  // Optionally, focus back on the search input
  this.$refs.searchInput.focus();
},
handleResultCardClick(result) {
  console.log("Clicked result card:", result);
  // Log collection name and title to console
  console.log("Collection:", result.collection);
  console.log("Title:", result.data.title);

  // Check if the card is from the "Movies" collection
  if (result.collection === "Movies") {
    // Call on populateModal function with movie data
    this.populateModal(result.data);
    // Show modal for movie details
    this.showModal();
  } else if (result.collection === "TV Series") {
    // Call on populateSeriesModal function with series data
    this.populateSeriesModal(result.data);
    // Show modal for series details
    this.showSeriesModal();
  }
},

async fetchVideos() {
  try {
    // Check if cache is valid
    if (this.isCacheValid()) {
      this.isLoading = false;
      return; // Use cached data
    }

    const db = firebase.firestore();
    const querySnapshot = await db.collection("ComingSoon").get();
    // Map through the query snapshot to extract video links
    this.videos = querySnapshot.docs.map(doc => doc.data().link);
    
    // Shuffle the videos using Fisher-Yates algorithm
    this.shuffleVideos();

    // Update last fetch time
    this.lastFetchTime = new Date().getTime();

    this.isLoading = false; // Set loading state to false
  } catch (error) {
    console.error("Error fetching videos:", error);
    this.isLoading = false; // Set loading state to false even in case of error
  }
},
shuffleVideos() {
  // Fisher-Yates shuffle algorithm
  for (let i = this.videos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [this.videos[i], this.videos[j]] = [this.videos[j], this.videos[i]];
  }
},
isCacheValid() {
  if (!this.lastFetchTime) return false; // No cache available
  const currentTime = new Date().getTime();
  return (currentTime - this.lastFetchTime) < this.cacheExpiry;
},
getVideoEmbedUrl(link) {
  // Extract the video ID from the YouTube link and generate the embed URL
  const videoId = this.extractVideoId(link);
  return `https://www.youtube.com/embed/${videoId}`;
},
extractVideoId(link) {
  // Extract video ID from YouTube link
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = link.match(regex);
  return match ? match[1] : null;
},
refreshData() {
  // Clear cached data from local storage for Movies
  localStorage.removeItem('movies');
  console.log("Successfully cleared cached movies data.");

  // Clear cached data from local storage for TV Series
  localStorage.removeItem('tvSeries');
  console.log("Successfully cleared cached TV series data.");

  // Clear UI by resetting data arrays to empty
  this.movies = [];
  this.tvSeries = [];
  this.bingeMovies = [];
  this.nollywoodMovies = [];
  this.cartoonsMovies = [];
  this.videos = [];
  this.searchResults = [];

  // Override timestamp of cached Firestore data and clear it
  this.lastFetchTime = null;

  // Trigger fetching data for movies and TV series
  this.fetchMovies();
  this.fetchTvSeries();

  console.log("Successfully cleared old cache and triggered data fetch.");
},

  },
};


  
const routes = [
  { path: '/', component: landingPage },
  { path: '/login', component: LoginPage },
  { path: '/signup', component: SignUpPage },
  { path:'/password', component:PasswordPage},
  {path: '/subscription', component: SubscriptionPage},
  {path : '/home', component: HomePage},
  ];
const router = new VueRouter({
  routes
});
const app = new Vue({
  router,
  el: '#app'
});