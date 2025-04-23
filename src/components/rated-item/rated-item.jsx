/* eslint-disable no-param-reassign */
import React, { useState, useEffect } from "react"
import { Alert, Spin } from "antd"

import MovieService from "../../services/API"
import MovieList from "../movie-list"

const api = new MovieService()

function RatedItem({ guestSessionId }) {
  const [currentRatedMovies, setRatedMovies] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchRatedMovies = async () => {
    try {
      setLoading(true)
      if (guestSessionId) {
        const ratedMoviesResult = await api.getRatedMovies(guestSessionId)
        setRatedMovies(ratedMoviesResult.results)
      } else {
        alert("Гостевая сессия отсутствует.")
      }
    } catch (error) {
      alert(`Ошибка при получении оцененных фильмов: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRatedMovies()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guestSessionId])

  const handleRatingChange = async ({ movieId, rating }) => {
    try {
      setLoading(true)
      await api.setMovieRate(movieId, guestSessionId, rating)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await fetchRatedMovies()
    } catch (err) {
      alert(`Ошибка при оценке фильма: ${err}`)
      setLoading(false)
    }
  }

  return (
    <div>
      {loading ? (
        <Spin size="large" />
      ) : currentRatedMovies.length > 0 ? (
        <MovieList
          movies={currentRatedMovies}
          onRatingChange={handleRatingChange}
        />
      ) : (
        <Alert
          message="Ошибка загрузки фильмов"
          description="У вас нет оцененных фильмов"
          type="info"
          showIcon
        />
      )}
    </div>
  )
}

export default RatedItem
