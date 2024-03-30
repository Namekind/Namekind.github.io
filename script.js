// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCd5-MacjDoG2HRK8fLaLQIVcpy9yCbmZk",
  authDomain: "tonymontana-7a21b.firebaseapp.com",
  databaseUrl: "https://tonymontana-7a21b-default-rtdb.firebaseio.com/",
  projectId: "tonymontana-7a21b",
  storageBucket: "tonymontana-7a21b.appspot.com",
  messagingSenderId: "1078221343146",
  appId: "1:1078221343146:web:8b2b0be87f2e5d6c0a43d3",
  measurementId: "G-WZQ4LJY18K"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();
const landingPage = { 
  template:
  `
    <transition name="fade">

    <div>
<h1 id="Majorlogo">Piccolo</h1>
<p id="berry">part of this story :)</p>

      <button  id="watchbtn" class="button" @click="$router.push('/authentication')">Watch</button>
    </div>
  </transition>
     `,
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
const Authentication = {
    template: `
    <div class="jet">
    <div v-if="message" :class="['message', messageType]">
    {{ message }}
</div>
        <div class="authentication">
        <!-- Add HTML for Message Display -->

            <!-- Login Form -->
            <div id="fillo" v-if="showLogin">
                <h2>Welcome!</h2>
          <p id="didi">We have curated interesting new content just for you <br> log in to enjoy!</p>
                <input type="email" v-model="loginEmail" placeholder="Email">
                <input type="password" v-model="loginPassword" placeholder="Password">
                <button @click="login">Login</button>
                <p @click="toggleForms('signup')">Don't have an account? Sign Up</p>
                <p @click="toggleForms('passwordRecovery')">Forgot Password?</p>
            </div>
            
            <!-- Sign Up Form -->
            <div v-if="showSignup">
                <h2>Join Piccolo</h2>
            <p id="didi">tell us a little about yourself</p>
                <input type="text" v-model="name" placeholder="Name">
                <input type="text" v-model="address" placeholder="Address">
                <input type="email" v-model="signupEmail" placeholder="Email">
                <input type="password" v-model="signupPassword" placeholder="Password (must be at least six characters)">
                <input type="tel" v-model="phone" placeholder="Phone (WhatsApp)">
                <button @click="signup">Sign Up</button>
                <p @click="toggleForms('login')">Already have an account? Login</p>
            </div>
            
            <!-- Password Recovery Form -->
            <div v-if="showPasswordRecovery">
                <h2>Lost Your Password? </h2>
                <p id="didi">let's get you a new one</p>
                <input type="email" v-model="recoverEmail" placeholder="Email">
                <button @click="recoverPassword">Recover Password</button>
                <p @click="toggleForms('login')">Remembered your password? Login</p>
            </div>
        </div>
       </div>
    `,
    data() {
        return {
            showLogin: true,
            showSignup: false,
            showPasswordRecovery: false,
            name: '',
            address: '',
            loginEmail: '',
            loginPassword: '',
            signupEmail: '',
            signupPassword: '',
            recoverEmail: '',
            phone: '',
            message: '', // Display message
            messageType: '' // Message type: 'success' or 'error'
        };
    },
    methods: {
    login() {
        firebase.auth().signInWithEmailAndPassword(this.loginEmail, this.loginPassword)
            .then((userCredential) => {
                const userData = {
                    email: this.loginEmail,
                    password: this.loginPassword,
                    userId: userCredential.user.uid,
                };
                localStorage.setItem('userData', JSON.stringify(userData));
                firebase.database().ref('Users/' + userData.userId).update({ logInStatus: true });
                this.$router.push({
                    path: '/home',
                    params: {
                        email: this.loginEmail,
                        userId: userData.userId,
                    },
                });
            })
            .catch(error => {
                console.error('Login Error:', error.message);
                this.showMessage(error.message, 'error');
            });
    },
    signup() {
    firebase.auth().createUserWithEmailAndPassword(this.signupEmail, this.signupPassword)
        .then((userCredential) => {
            const userEmail = this.signupEmail;
            firebase.firestore().collection("Users").doc(userEmail).set({
                name: this.name,
                email: userEmail,
                password: this.signupPassword,
                address: this.address,
                phone: this.phone,
            })
            .then(() => {
                console.log("Document successfully written!");
                // Display a success message
                this.showMessage('Sign up successful. Please log in.', 'success');
                // Show the login form
                this.showLogin = true;
                // Hide other forms
                this.showSignup = false;
                this.showPasswordRecovery = false;
                // Clear input fields
                this.name = '';
                this.address = '';
                this.signupEmail = '';
                this.signupPassword = '';
                this.phone = '';
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
                this.showMessage(error.message, 'error');
            });
        })
        .catch(error => {
            console.error('Signup Error:', error.message);
            this.showMessage(error.message, 'error');
        });
},
    recoverPassword() {
        db.collection('Users').doc(this.recoverEmail).get()
            .then(doc => {
                if (doc.exists) {
                    firebase.auth().sendPasswordResetEmail(this.recoverEmail)
                        .then(() => {
                            console.log('Password reset email sent.');
                            this.showMessage('Password reset email sent.', 'success');
                        })
                        .catch(error => {
                            console.error('Password reset email not sent:', error.message);
                            this.showMessage('Failed to send password reset email. Please try again later.', 'error');
                        });
                } else {
                    console.error('Email not found in users collection.');
                    this.showMessage('Email not found. Please enter a valid email.', 'error');
                }
            })
            .catch(error => {
                console.error('Firestore query error:', error.message);
                this.showMessage('An error occurred. Please try again later.', 'error');
            });
    },
    toggleForms(form) {
        this.showLogin = false;
        this.showSignup = false;
        this.showPasswordRecovery = false;
        
        if (form === 'login') {
            this.showSplash = false;
            this.showLogin = true;
        } else if (form === 'signup') {
            this.showSplash = false;
            this.showSignup = true;
        } else if (form === 'passwordRecovery') {
            this.showSplash = false;
            this.showPasswordRecovery = true;
        }
    },
    showMessage(message, type) {
        this.message = message;
        this.messageType = type;
        setTimeout(() => {
            this.message = '';
            this.messageType = '';
        }, 5000);
    }
}
};
const Home = {
    template: `
   <div>
        <div class="sticky-header" style="display: flex; justify-content: space-between; align-items: center;">
            <div class="logo" style="order: 1;">
                <h1 style="color: #FF61F6; font-size: 20px;">Piccolo</h1>
            </div>
            <div style="order: 2;">
  <button id="refresh-toggle" class="refresh-button" @click="refreshData"><i class="fas fa-sync-alt" style="font-size:20px"></i></button>
  
<button id="shuffle-toggle" class="shuffle-button" data-tooltip="Shuffle Cards" @click="shuffleCards"><i class="fas fa-random" style="font-size:25px"></i></button>

<button id="search-toggle" class="Search" data-tooltip="Search" @click="goToSearch"><i class="fas fa-search" style="font-size:25px"></i></button>

<button id="profile-toggle" data-tooltip="Profile" @click="goToProfile">
  <i class="fas fa-user-circle" style="font-size:25px"></i>
</button>
            </div>
        </div>
         <div style="display:none">
        <div class="subscription-timer"><i class="far fa-clock"></i> Subscription Expires in <span class="countdown-timer">{{ countdownTimer }}</span> days</div>
        <div class="username"><i class="fas fa-user"></i> <span class="username">{{ username }}</span>
        </div>

                </div>
<div class="alert-banner">
        <p><i class="fas fa-exclamation-circle"></i> Piccolo is under development. Version 7 is live!</p>
        <p>Some features may be limited. Watchlists, cast trivias, and more coming soon on Playstore and Appstore.</p>
        <p>Help us improve! Report issues and glitches <a href="https://wa.me/+2347069490226?" target="_blank"><i class="fab fa-whatsapp"></i> here</a>.</p>
        <p>Rest assured, Piccolo aims to offer a seamless experience.</p>
    </div>
    
<h3 class="Realtitle">
    <i class="fas fa-fire"></i> Hot & Now (Trending Movies)
  </h3>
            <div class="MovieCards" ref="movieCards" @scroll="saveScrollPosition">
                <div class="card" v-for="(movie, index) in movies" :key="index" @click="goToCardDetails(movie)">
                    <img :src="movie.posterLink" alt="Movie Poster" loading="lazy">
                    <h3>{{ movie.title }}</h3>
                                <p id="movierating" style="color:gold" class="rating"><span v-html="displayRating(movie.rating)"></span></p>
                </div>
            </div>
<h3 class="Realtitle">
    <i class="fas fa-dice"></i> Your Next Binge Awaits (Random Movies)
  </h3>
            <div class="bingeCards" ref="bingeCards" @scroll="savebingeScrollPosition">
                <div id="bolo" class="card" v-for="(bingeItem, index) in binge" :key="index" @click="goToCardDetails(bingeItem)">
                    <img :src="bingeItem.posterLink" alt="Movie Poster" loading="lazy">
                    <h3>{{ bingeItem.title }}</h3>
                </div>
            </div>
            <h3 class="Realtitle">
    <i class="fas fa-theater-masks"></i> Nollywood Drama: Jewels that dazzle, roaring lions (Nigerian Movies)
  </h3>
             <div class="nollyCards" ref="nollyCards" @scroll="savenollyScrollPosition">
                <div id="bolo" class="card" v-for="(nollyItem, index) in nolly" :key="index" @click="goToCardDetails(nollyItem)">
                    <img :src="nollyItem.posterLink" alt="Movie Poster" loading="lazy">
                    <h3>{{ nollyItem.title }}</h3>
                </div>
            </div>
<h3 class="Realtitle">
    <i class="fas fa-laugh-beam"></i> Animated Adventures (Cartoons)
  </h3>
 <div class="cartoonsCards" ref="cartoonsCards" @scroll="savecartoonsScrollPosition">
                <div id="bolo" class="card" v-for="(cartoonsItem, index) in cartoons" :key="index" @click="goToCardDetails(cartoonsItem)">
                    <img :src="cartoonsItem.posterLink" alt="Movie Poster" loading="lazy">
                    <h3>{{ cartoonsItem.title }}</h3>
                </div>
            </div>
  
  <h3 class="Realtitle">
    <i class="fas fa-cat"></i> Keeping Up with... (Tv Shows)
  </h3>
 <div class="seriesCards" ref="seriesCards" @scroll="saveseriesScrollPosition">
                <div id="folo" class="card" v-for="(seriesItem, index) in series" :key="index" @click="goToSeriesDetails(seriesItem)">
                    <img :src="seriesItem.posterLink" alt="Movie Poster" loading="lazy">
                    <h3>{{ seriesItem.title }}</h3>
                </div>
            </div> 
            
<h3 class="Realtitle">
    <i class="fas fa-clock"></i> Coming Soon </h3>
<div class="coming-soon-section">
            <div class="trailer-list">
                <iframe v-for="trailer in shuffledTrailers" :key="trailer.id" :src="getEmbeddableLink(trailer.link)" frameborder="0" allowfullscreen loading="lazy"></iframe>
            </div>
        </div>
  
            <footer style="font-family: 'Arial', sans-serif; font-size: 14px; color: #333; text-align: center; padding: 20px;">
    <p style="font-weight: bold;">&copy; 2024 Piccolo by Ima Studios</p>
    <p style="font-style: italic;">We curate video contents. All rights to the videos belong to their respective studios. Subscription fee paid on the app is for our services in bringing and assembling these amazing videos.</p>
    <p style="font-size: 16px;">Made with <span style="color: red;">❤️</span> & <span style="color: #ffcc00;">🦩, "imaandworld" </span></p>
    <div style="margin-top: 10px;">
        <p>Powered by:</p>
<i class="fab fa-mdb" style="font-size: 24px; color: rgba(245, 245, 245, 0.8);"></i>
<i class="fab fa-github" style="font-size: 24px; color: rgba(245, 245, 245, 0.8);"></i>
<i class="fab fa-google" style="font-size: 24px; color: rgba(245, 245, 245, 0.8);"></i>
<i class="fab fa-cloudflare" style="size: 24px; color: rgba(245, 245, 245, 0.8);"></i>
<i class="fab fa-whatsapp" style="font-size: 24px; color: rgba(245, 245, 245, 0.8);"></i>
<i class="fas fa-robot" style="font-size: 24px; color: rgba(245, 245, 245, 0.8);"></i>


    </div>
    <p style="margin-top: 10px;">Cool City, Delta State, Nigeria</p>
</footer>
            
            
        </div>
    </div>
    `,
data() {
    return {
      username: '',
      countdownTimer: '00:00:00', 
        showSidebar: false,
        movies: [],
        binge: [],
        nolly: [],
        cartoons: [],
        series:[],
        trailers: [],
        shuffledTrailers: []
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
    this.checkCachedData();
    this.fetchTrailers();
    setInterval(() => {
        this.fetchTrailers();
    }, 172800000); // Refresh every 48 hours
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
            this.$router.push('/authentication');
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
        this.$router.push('/authentication');
      }).catch(error => {
        console.error('Logout Error:', error.message);
      });
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
shuffleCards() {
    this.shuffleSection(this.movies);
    this.shuffleSection(this.binge);
    this.shuffleSection(this.nolly);
    this.shuffleSection(this.cartoons);
    this.shuffleSection(this.series);

    // Update the data properties with shuffled data
    this.movies = [...this.movies];
    this.binge = [...this.binge];
    this.nolly = [...this.nolly];
    this.cartoons = [...this.cartoons];
    this.series = [...this.series];
},
shuffleSection(section) {
    for (let i = section.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = section[i];
        section[i] = section[j];
        section[j] = temp;
    }
},
  goToSearch() {
        this.$router.push('/search'); // Assuming you have access to the router instance
    },
  goToProfile() {
      this.$router.push('/profile'); // Assuming you have access to the router instance
    },
    async checkCachedData() {
        const cachedTime = localStorage.getItem('cachedTime');
        
        if (cachedTime && (Date.now() - parseInt(cachedTime) <= 24 * 60 * 60 * 1000)) {
            this.movies = JSON.parse(localStorage.getItem('moviesData')) || [];
            this.binge = JSON.parse(localStorage.getItem('bingeData')) || [];
            this.nolly = JSON.parse(localStorage.getItem('nollyData')) || [];
            this.cartoons = JSON.parse(localStorage.getItem('cartoonsData')) || [];
            this.series = JSON.parse(localStorage.getItem('seriesData')) || [];
            
            console.log("Using cached data to populate the page.");
        } else {
            await this.fetchData();
        }
    },
    async fetchData() {
        try {
            const collections = ["Movies", "Binge", "Nollywood", "Cartoons", "TvSeries"];
            const promises = collections.map(collectionName => {
                const collectionRef = db.collection(collectionName);
                return collectionRef.get().then(querySnapshot => {
                    const data = [];
                    querySnapshot.forEach(doc => {
                        data.push(doc.data());
                    });
                    localStorage.setItem(`${collectionName}Data`, JSON.stringify(data));
                    this[collectionName.toLowerCase()] = data; // Update data property
                    console.log(`Fetched ${collectionName} data from Firestore.`);
                });
            });

            // Wait for all promises to resolve
            await Promise.all(promises);

            // Set timestamp for cached data
            localStorage.setItem('cachedTime', Date.now());

            console.log("Data fetching completed successfully.");
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    },
    async fetchTrailers() {
        try {
            const cachedTrailers = localStorage.getItem('trailersData');
            if (cachedTrailers) {
                this.trailers = JSON.parse(cachedTrailers);
                this.shuffleTrailers();
                console.log("Using cached trailers data.");
            } else {
                await this.fetchTrailersData();
            }
        } catch (error) {
            console.error("Error fetching trailers:", error);
        }
    },
    async fetchTrailersData() {
        const trailersRef = db.collection("trailers");
        trailersRef.get().then((querySnapshot) => {
            const trailers = [];
            querySnapshot.forEach((doc) => {
                const trailerData = doc.data();
                trailers.push(trailerData);
            });
            this.trailers = trailers;
            this.shuffleTrailers();
            localStorage.setItem('trailersData', JSON.stringify(trailers));
            console.log("Fetched and cached trailers data from Firestore.");
        });
    },
getEmbeddableLink(youtubeLink) {
            const videoId = youtubeLink.split('/').pop().split('?')[0];
            return `https://www.youtube.com/embed/${videoId}`;
        },
        shuffleTrailers() {
            this.shuffledTrailers = this.trailers.slice();
            for (let i = this.shuffledTrailers.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.shuffledTrailers[i], this.shuffledTrailers[j]] = [this.shuffledTrailers[j], this.shuffledTrailers[i]];
            }
        },
        goToCardDetails(movie) {
            this.$router.push({ path: `/card-details/${movie.title}`, query: { movieData: JSON.stringify(movie) } });
        },
        savenollyScrollPosition() {
            localStorage.setItem('nollyScrollPosition', this.$refs.nollyCards.scrollLeft);
        },
savecartoonsScrollPosition() {
            localStorage.setItem('cartoonsScrollPosition', this.$refs.cartoonsCards.scrollLeft);
        },
        savebingeScrollPosition() {
            localStorage.setItem('bingeScrollPosition', this.$refs.bingeCards.scrollLeft);
        },
        
  saveseriesScrollPosition() {
            localStorage.setItem('seriesScrollPosition', this.$refs.seriesCards.scrollLeft);
        },
        saveScrollPosition() {
            localStorage.setItem('scrollPosition', this.$refs.movieCards.scrollLeft);
        },
    
refreshTrailersData() {
    localStorage.removeItem('trailersData');
    this.trailers = [];
    this.fetchTrailersData();
    console.log("Refreshed trailers data successfully.");
},
refreshData() {
    // Clear cached data
    localStorage.removeItem('moviesData');
    localStorage.removeItem('bingeData');
    localStorage.removeItem('nollyData');
    localStorage.removeItem('cartoonsData');
    localStorage.removeItem('seriesData');

    // Clear UI content
    this.movies = [];
    this.binge = [];
    this.nolly = [];
    this.cartoons = [];
    this.series = [];

    // Fetch fresh data from Firestore
    const fetchMovies = db.collection("Movies").get().then((querySnapshot) => {
        const movies = [];
        querySnapshot.forEach((doc) => {
            const movieData = doc.data();
            movies.push(movieData);
        });
        localStorage.setItem('moviesData', JSON.stringify(movies));
        this.movies = movies;
    });

    const fetchBinge = db.collection("Binge").get().then((querySnapshot) => {
        const binge = [];
        querySnapshot.forEach((doc) => {
            const bingeData = doc.data();
            binge.push(bingeData);
        });
        localStorage.setItem('bingeData', JSON.stringify(binge));
        this.binge = binge;
    });

    const fetchNollywood = db.collection("Nollywood").get().then((querySnapshot) => {
        const nolly = [];
        querySnapshot.forEach((doc) => {
            const nollyData = doc.data();
            nolly.push(nollyData);
        });
        localStorage.setItem('nollyData', JSON.stringify(nolly));
        this.nolly = nolly;
    });

    const fetchCartoons = db.collection("Cartoons").get().then((querySnapshot) => {
        const cartoons = [];
        querySnapshot.forEach((doc) => {
            const cartoonsData = doc.data();
            cartoons.push(cartoonsData);
        });
        localStorage.setItem('cartoonsData', JSON.stringify(cartoons));
        this.cartoons = cartoons;
    });
    
    const fetchTvSeries = db.collection("TvSeries").get().then((querySnapshot) => {
        const series = [];
        querySnapshot.forEach((doc) => {
            const seriesData = doc.data();
            series.push(seriesData);
        });
        localStorage.setItem('seriesData', JSON.stringify(series));
        this.series = series;
    });

    // Wait for all fetch operations to complete before triggering refreshTrailersData
    Promise.all([fetchMovies, fetchBinge, fetchNollywood, fetchCartoons, fetchTvSeries]).then(() => {
        // Notify in console log
        console.log("Refreshed data successfully.");
        // Trigger refreshTrailersData
        this.refreshTrailersData();
    });
},

goToSeriesDetails(series) {
            this.$router.push({ path: `/series-details/${series.title}`, query: { seriesData: JSON.stringify(series) } });
        },

},
mounted() {
const savedScrollPosition = localStorage.getItem('scrollPosition');
    if (savedScrollPosition) {
        this.$refs.movieCards.scrollLeft = savedScrollPosition;
    }

    const savedbingeScrollPosition = localStorage.getItem('bingeScrollPosition');
    if (savedbingeScrollPosition) {
        this.$refs.bingeCards.scrollLeft = savedbingeScrollPosition;
    }
    
    const savednollyScrollPosition = localStorage.getItem('nollyScrollPosition');
    if (savednollyScrollPosition) {
        this.$refs.nollyCards.scrollLeft = savednollyScrollPosition;
    }
    
    const savedcartoonsScrollPosition = localStorage.getItem('cartoonsScrollPosition');
    if (savedcartoonsScrollPosition) {
        this.$refs.cartoonsCards.scrollLeft = savedcartoonsScrollPosition;
    }
        const savedseriesScrollPosition = localStorage.getItem('seriesScrollPosition');
    if (savedseriesScrollPosition) {
        this.$refs.seriesCards.scrollLeft = savedseriesScrollPosition;
    }

// Check if cached trailers data expired
    const cachedTrailersTime = localStorage.getItem('cachedTrailersTime');
    if (cachedTrailersTime && (Date.now() - parseInt(cachedTrailersTime) > 24 * 60 * 60 * 1000)) {
        console.log("Cached trailers data expired. Refreshing...");
        this.refreshTrailersData();
        localStorage.setItem('cachedTrailersTime', Date.now());
    }
}
};
const CardDetails = {
    template: `
        <div class="card-details">
            <img class="backdrop" :src="movieData.backdrop" alt="Movie backdrop">
            <div class="cardinfo">
            <h2>{{ $route.params.card }}</h2>

<p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 300; opacity: 0.6; text-align: center;">"{{ movieData.tagline }}"</p>

            <p style="color:gold" class="rating"><span v-html="displayRating(movieData.rating)"></span></p>
            <p>{{ movieData.synopsis }}</p>
            <p>Genre: {{ movieData.genre }}</p>
            <p>Cast: {{ movieData.cast }}</p>
            <a :href="movieData.videoLink" style="display: inline-block; padding: 10px 20px; background-color: whitesmoke; color: black; border-radius: 5px; text-decoration: none;"><i class="fas fa-play"></i> Watch</a>
        </div>
              <div class="instruction">
  <p>
<i class="fa-solid fa-up-right-and-down-left-from-center"></i> Click Fullscreen for a better view.
    <br>
    <i class="fas fa-cog"></i> Click on Settings to adjust video quality and save mobile data.
    <br>
    <i class="fas fa-mobile-alt"></i> Rotate your phone for landscape view.
  </p>
</div>
        </div>
    `,
    data() {
        return {
            movieData: JSON.parse(this.$route.query.movieData) || {}
        };
    },
    methods:{
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
    }
};
const SeriesDetails = {
    template: `
<div id="volo" class="card-details">
    <img class="backdrop" :src="seriesData.backdrop" alt="Series backdrop">
    <div class="cardinfo">
      <h2>{{ seriesData.title }}</h2>
      <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 300; opacity: 0.6; text-align: center;">"{{ seriesData.tagline }}"</p>
      <p style="color:gold" class="rating"><span v-html="displayRating(seriesData.rating)"></span></p>

      <p>{{ seriesData.synopsis }}</p>
      <p>Genre: {{ seriesData.genre }}</p>
      <p>Cast: {{ seriesData.cast }}</p>
      <div v-if="Object.keys(seriesData).some(key => key.startsWith('season'))">
        <div v-for="(season, seasonNumber) in seasons" :key="seasonNumber">
          <button @click="toggleSeason(seasonNumber)" data-season>Season {{ seasonNumber }}</button>
          <div v-show="activeSeason === seasonNumber">
            <button v-for="(episode, episodeNumber) in season" :key="episodeNumber" @click="watchEpisode(episode.videoLink)" data-episode>
              Episode {{ episodeNumber }}
            </button>
          </div>
          </div>
      </div>
    </div>
      <div class="instruction">
  <p>
<i class="fa-solid fa-up-right-and-down-left-from-center"></i> Click Fullscreen for a better view.
    <br>
    <i class="fas fa-cog"></i> Click on Settings to adjust video quality and save mobile data.
    <br>
    <i class="fas fa-mobile-alt"></i> Rotate your phone for landscape view.
  </p>
</div>
  </div>
    `,
    data() {
        return {
            seriesData: JSON.parse(this.$route.query.seriesData) || {},
            seasons: {},
            activeSeason: null
        };
    },
    mounted() {
        this.groupSeasonsAndEpisodes();
    },
    methods: {
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
        groupSeasonsAndEpisodes() {
            const seasons = {};
            for (const key in this.seriesData) {
                if (key.startsWith('season')) {
                    const seasonNumber = key.split(' ')[1];
                    const episode = this.seriesData[key];
                    if (!seasons[seasonNumber]) {
                        seasons[seasonNumber] = {};
                    }
                    seasons[seasonNumber][key] = episode;
                }
            }
            this.seasons = seasons;
        },
        toggleSeason(seasonNumber) {
            if (this.activeSeason === seasonNumber) {
                this.activeSeason = null;
            } else {
                this.activeSeason = seasonNumber;
            }
        },
        watchEpisode(episodeLink) {
            // Load the episode link directly
            window.location.href = episodeLink;
        }
    }
};
const Search = {
    template: `
        <div>
            <div id="searchbar">
                <input type="text" v-model="searchQuery" placeholder="Find Movies & Tv shows...">
                <button @click="search">Search</button>
            </div>
            <div class="search-results">
                <div class="result-card" v-for="(result, index) in searchResults" :key="index" @click="viewDetails(result)">
                    <img :src="result.posterLink" alt="Result Poster" loading="lazy">
                    <h3>{{ result.title }}</h3>
                </div>
            </div>
            <div v-if="showMessage" class="message">
                {{ messageText }}
            </div>
        </div>
    `,
    data() {
        return {
            searchQuery: '',
            searchResults: [],
            showMessage: false,
            messageText: '',
            movies: [],
            binge: [],
            nolly: [],
            cartoons: [],
            series: []
        };
    },
    created() {
        this.movies = JSON.parse(localStorage.getItem('moviesData')) || [];
        this.binge = JSON.parse(localStorage.getItem('bingeData')) || [];
        this.nolly = JSON.parse(localStorage.getItem('nollyData')) || [];
        this.cartoons = JSON.parse(localStorage.getItem('cartoonsData')) || [];
        this.series = JSON.parse(localStorage.getItem('seriesData')) || [];
    },
    methods: {
        search() {
            const searchTerm = this.searchQuery.toLowerCase().trim();
            if (searchTerm === '') {
                this.showMessage = true;
                this.messageText = 'Please enter a search term.';
                return;
            }

            const allData = [...this.movies, ...this.binge, ...this.nolly, ...this.cartoons, ...this.series];

            this.searchResults = allData.filter(item => {
                const includesTerm = item.title.toLowerCase().includes(searchTerm);
                if (includesTerm) {
                    item.category = this.movies.includes(item) ? 'movie' : 'series';
                }
                return includesTerm;
            });

            if (this.searchResults.length === 0) {
                this.showMessage = true;
                this.messageText = 'No results found. Please try a different search term.';
            } else {
                this.showMessage = false;
            }
        },
        viewDetails(result) {
            if (result.category === 'movie') {
                this.$router.push({ path: `/card-details/${result.title}`, query: { movieData: JSON.stringify(result) } });
            } else if (result.category === 'series') {
                this.$router.push({ path: `/series-details/${result.title}`, query: { seriesData: JSON.stringify(result) } });
            }
        }
    }
};
const Subscription = {
  template:`
<transition name="bounce">
    <div id="sub-pages">
      <div>
        <div>
          <div>
            <h1 id="partner">Stageseller <i class="fas fa-star" style="color:gold"></i></h1>
            <p class="lead">Piccolo's Official Payment Partner</p>
          </div>
          <div  id="sub-card">
            <div>
              <h3 class="mb-0">Unlock Endless Entertainment for N500/Month</h3>
            </div>
            <form @submit.prevent="handlePasskeySubmission">
            <div>
              <div>

                  <h4 class="mb-3">Simple Steps to Subscribe:</h4>
              <div id="subtext">
                  <ol>
                    <li>
                      <i class="far fa-money-bill-alt"></i> Make Payment to the Bank Account
                    </li>
                    <li>
                      <i class="far fa-file-pdf"></i> Send Payment Proof (Screenshot or PDF) to our Official WhatsApp Contact
                    </li>
                    <li>
                      <i class="fas fa-key"></i> Receive Your Passkey and Enter It Below
                    </li>
                    <li>
                      <i class="far fa-smile"></i> Enjoy Piccolo!
                    </li>
                  </ol>
                </div>
              <h4 class="mb-3">Payment Information:</h4>
                <div id="Paymentinfo">
                  <ul>
                    <li>Bank: Best Star Microfinance Bank (Beststar MFB)</li>
                    <li>Account Name: Stageseller</li>
                    <li>Account Number: 7069490226</li>
                    <li>Amount: N500 Only</li>
                  </ul>
                   </div>
<button id="wabtn">
  <a href="https://wa.me/+2347069490226?" target="_blank">
  <i class="fab fa-whatsapp"></i> Send Payment Proof Here</a>
</button>
                  <div >
                <input type="text" id="passkey" v-model="passkey" required placeholder="Enter Your Passkey Here">
                   
                <button id="submitsub" type="submit-key">Subscribe</button>
                  </div>
               
        <button id="quitbtn" @click="quitSubscription">Log out & Switch Accounts</button>
              </div>
            </div>
                </form>
            <div id="finalsub">
              <p>
                StageSeller makes subscriptions easy with simple bank transfers or USSD transactions.
              </p>
              <p>
                <i class="far fa-clock"></i> 24/7 Agent Support Available
              </p>
              <p>
                <a href="https://wa.me/+2347069490226?">Contact Us</a> for any issues, glitches, or feedback. We're here to make your experience seamless!
              </p>
              </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
    `,
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
        this.$router.push('/authentication');
      }).catch(error => {
        console.error('Logout Error:', error.message);
      });
    },
  },
};
const Profile = {
  template: `
  <div class="profile-container">
  <h2 class="profile-title">Logged in as: {{ username }}</h2>
  <div class="user-info">
    <p>User ID: {{ userId }}</p>
  </div>
  <p>Log Out or Switch Accounts</p>
  <div @click="logoutUser" class="logout-btn"><i class="fas fa-sign-out-alt"></i> Log Out</div>
</div>
  `,
  data() {
    return {
      username: '',
      userId: '',
    };
  },
  created() {
    // Retrieve username and userId from the cookie
    const cookieData = document.cookie.split('; ').find(row => row.startsWith('userId='));
    if (cookieData) {
      this.userId = cookieData.split('=')[1];
    }

    // Retrieve username from the cookie or local storage
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
      this.username = userData.email;
    }
  },
  methods: {
    logoutUser() {
      // Set the user login status to false in the real-time database
      firebase.database().ref('Users/' + this.userId).update({ logInStatus: false });

      // Log out the user
      firebase.auth().signOut().then(() => {
        // Redirect to the login page after logout
        this.$router.push('/authentication');
      }).catch(error => {
        console.error('Logout Error:', error.message);
      });
    },
  },
};

const ErrorPage = {
    template: `
        <div class="error-page">
            <i class="fas fa-bed"></i> <!-- Example Font Awesome icon -->
            <h3>Oops! Piccolo Servers are still asleep.</h3>
            <p>Please try again later, check your internet connection, and refresh the page. If the issue persists, contact support.</p>
            <a href="support-link">Contact Support</a>
        </div>
    `
};
const routes = [
  { path: '/', component: landingPage },
  { path: '/authentication', component: Authentication },
    { path: '/home', component: Home }, // Changed '*' to '/' for the Home component
  { path: '/profile', component: Profile },
    { path: '/subscription', component: Subscription },
  { path: '/search', component: Search },
    { path: '/card-details/:card', component: CardDetails },
    { path: '/series-details/:card', component: SeriesDetails },
    { path: '*', component: ErrorPage } // Corrected 'Error' to '*'
];
const router = new VueRouter({
    routes
});
const app = new Vue({
    router
}).$mount('#app');
