/* eslint-disable no-param-reassign */
class MovieService {
  _apiBase = "https://api.themoviedb.org/3"

  _apiKey = "fdba9418be6bee4ecbc6e274612081dd"

  _getOptions = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmZGJhOTQxOGJlNmJlZTRlY2JjNmUyNzQ2MTIwODFkZCIsIm5iZiI6MTc0NDcyNzc4OS42NDYwMDAxLCJzdWIiOiI2N2ZlNmVlZGQ2NDVlNDFlMDk5OTIyZTciLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.nI_OFR1MR9I_FkDEjsPC91np_RJ-NzH6atoJELmwc5o",
    },
  }

  getResource = async (url) => {
    const response = await fetch(this._apiBase + url, this._getOptions)
    const body = await response.json()

    if (body.success === false) {
      throw new Error(body.status_message)
    } else {
      return body
    }
  }

  async getByKeyword(keyword, page = 1) {
    return this.getResource(
      `/search/movie?query=${keyword}&language=en-US&page=${page}`
    )
  }

  getMovie(id) {
    return this.getResource(`/movie/${id}`)
  }

  getTranding = (page) => {
    const intPage = parseInt(page, 10)
    return this.getResource(
      `/trending/movie/day?language=en-US&page=${intPage}`
    )
  }

  createGuestSession = async () => {
    const responce = await fetch(
      `${this._apiBase}/authentication/guest_session/new`,
      this._getOptions
    )
    const body = await responce.json()
    if (!body.success) {
      throw new Error(body.status_message)
    } else {
      return body.guest_session_id
    }
  }

  setMovieRate = async (filmId, guestSessionId, rateValue) => {
    const responce = await fetch(
      `${this._apiBase}/movie/${filmId}/rating?guest_session_id=${guestSessionId}&api_key=${this._apiKey}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json;charset=utf-8",
        },
        body: `{"value":${rateValue}}`,
      }
    )
    const body = await responce.json()
    if (!body.success) {
      throw new Error(body.status_message)
    } else {
      return body
    }
  }

  getRatedMovies = async (sessionId, page = 1) => {
    const responce = await fetch(
      `${this._apiBase}/guest_session/${sessionId}/rated/movies?language=en-US&page=${page}&api_key=${this._apiKey}`
    )
    const body = await responce.json()
    if (body.success === false) {
      throw new Error(body.status_message)
    } else {
      return body
    }
  }

  getGenreList = async () => {
    const responce = await fetch(
      `${this._apiBase}/genre/movie/list?language=en`,
      this._getOptions
    )
    const body = await responce.json()
    if (body.success === false) {
      throw new Error(body.status_message)
    } else {
      return body.genres
    }
  }
}

export default MovieService
