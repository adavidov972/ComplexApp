
import axios from 'axios'
export default class Search {

// Select DOM element 

    constructor () {
        this.injectHTML()

        this.searchIcon = document.querySelector(".header-search-icon")
        this.overlay = document.querySelector(".search-overlay")
        this.closeOverlayIcon = document.querySelector(".close-live-search")
        this.liveSearchInput = document.querySelector("#live-search-field")
        this.resultsArea = document.querySelector(".live-search-results")
        this.spinner = document.querySelector(".circle-loader")

        this.typingTimer
        this.previousValue = ""
        this.evants()
    }

    //Events
    evants() {
        this.searchIcon.addEventListener("click", (e) => {
            e.preventDefault()
            this.openOverlay()
        })

        this.closeOverlayIcon.addEventListener("click", () => this.closeOverlay())
        this.liveSearchInput.addEventListener('keyup', () => this.keyPressHandler())
    }
    //Mothods

    openOverlay () {
        this.overlay.classList.add('search-overlay--visible')
        setTimeout(() => this.liveSearchInput.focus(), 50)
    }

    closeOverlay() {
        this.overlay.classList.remove("search-overlay--visible")
    }
    
    showLoaderIcon() {
        this.spinner.classList.add('circle-loader--visible')
    }

    hideLoaderIcon() {
        this.spinner.classList.remove('circle-loader--visible')
    }

    showResultsArea () {
        this.resultsArea.classList.add('live-search-results--visible')
    }

    hideResultsArea () {
        this.resultsArea.classList.remove('live-search-results--visible')
    }

    keyPressHandler () {
        let value = this.liveSearchInput.value
        this.hideResultsArea()

        if (value == "") {
            clearTimeout(this.typingTimer)
            this.hideLoaderIcon()
        }

        if (value != "" && value != this.previousValue) {
            clearTimeout(this.typingTimer)
            this.showLoaderIcon()
            this.typingTimer = setTimeout(() => {this.sendSearchRequest()}, 1000)
        }
        this.previousValue = value
    }

    renderResults (posts) {
        this.hideLoaderIcon()
        
        if (posts.length) {
            this.resultsArea.innerHTML = `<div class="list-group shadow-sm">
            <div class="list-group-item active"><strong>Search Results</strong> (${posts.length > 1 ? `${posts.length} items found` : `1 item found`}) </div>
    
            ${posts.map(post => {
                let postDate = new Date(post.createdAt)
                return `<a href="/post/${post._id}" class="list-group-item list-group-item-action">
                <img class="avatar-tiny" src="https://gravatar.com/avatar/b9216295c1e3931655bae6574ac0e4c2?s=128"> <strong>${post.title}</strong>
                <span class="text-muted small">by ${post.author.username} on ${postDate.getDate()}/${postDate.getMonth()+1}/${postDate.getFullYear()}</span>
                </a>`
            }).join('')}
            
            </div>`
        } else {
            this.resultsArea.innerHTML = `<p class="alert alert-danger text-center shadow-sm">We could nor find results</p>`
        }
        this.showResultsArea()
    }

    sendSearchRequest() {        
        axios.post ('/search', {searchTerm : this.liveSearchInput.value})
        .then(results => this.renderResults(results.data))
        .catch((e) => console.log(e))
    }


    injectHTML () {
        document.body.insertAdjacentHTML('beforeend', `<!-- search feature begins -->
        <div class="search-overlay">
          <div class="search-overlay-top shadow-sm">
            <div class="container container--narrow">
              <label for="live-search-field" class="search-overlay-icon"><i class="fas fa-search"></i></label>
              <input type="text" id="live-search-field" class="live-search-field" placeholder="What are you interested in?">
              <span class="close-live-search"><i class="fas fa-times-circle"></i></span>
            </div>
          </div>
      
          <div class="search-overlay-bottom">
            <div class="container container--narrow py-3">
              <div class="circle-loader"></div>
              <div class="live-search-results"></div>
            </div>
          </div>
        </div>
        <!-- search feature end -->`)
    }
}