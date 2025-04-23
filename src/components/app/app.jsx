/* eslint-disable no-unused-vars */
import React, { useReducer, useEffect, useCallback } from "react"
import { Layout, Pagination, Input, Tabs, Spin, Alert } from "antd"
import debounce from "lodash/debounce"

import MovieService from "../../services/API"
import MovieList from "../movie-list"
import RatedItem from "../rated-item"
import { GenresProvider } from "../genres/genres"

const { Content } = Layout
const api = new MovieService()

const initialState = {
  movies: [],
  currentPage: 1,
  totalResults: 0,
  searchTerm: "",
  genres: [],
  guestSessionId: "",
  activeTab: "search",
  loading: true,
  showAlert: false,
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_MOVIES":
      return {
        ...state,
        movies: action.payload.movies,
        totalResults: action.payload.totalResults,
        currentPage: action.payload.currentPage,
        loading: false,
        showAlert: false,
      }
    case "SET_SEARCH_TERM":
      return { ...state, searchTerm: action.payload }
    case "SET_GENRES":
      return { ...state, genres: action.payload }
    case "SET_GUEST_SESSION":
      return { ...state, guestSessionId: action.payload }
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload }
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_ALERT":
      return { ...state, showAlert: action.payload }
    case "SET_PAGE":
      return { ...state, currentPage: action.payload }
    default:
      return state
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const {
    movies,
    currentPage,
    totalResults,
    searchTerm,
    genres,
    guestSessionId,
    activeTab,
    loading,
    showAlert,
  } = state

  const tabs = [
    { key: "search", label: "Search" },
    { key: "rated", label: "Rated" },
  ]

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genreList = await api.getGenreList()
        dispatch({ type: "SET_GENRES", payload: genreList })
      } catch (error) {
        alert(`Ошибка в получении жанров: ${error.message}`)
      }
    }

    const createGuestSession = async () => {
      try {
        const sessionId = await api.createGuestSession()
        dispatch({ type: "SET_GUEST_SESSION", payload: sessionId })
      } catch (error) {
        alert(`Ошибка при создании гостевой сессии: ${error.message}`)
      }
    }

    fetchGenres()
    createGuestSession()
  }, [])

  useEffect(() => {
    const loadMovies = async () => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })
        const trimmedTerm = searchTerm.trim()
        const movieResults = trimmedTerm
          ? await api.getByKeyword(trimmedTerm, currentPage)
          : await api.getTranding(currentPage)

        dispatch({
          type: "SET_MOVIES",
          payload: {
            movies: movieResults.results,
            totalResults: movieResults.total_results,
            currentPage,
          },
        })
      } catch (error) {
        dispatch({ type: "SET_ALERT", payload: true })
      }
    }

    loadMovies()
  }, [searchTerm, currentPage])

  const debouncedInput = useCallback(
    debounce((value) => {
      dispatch({ type: "SET_SEARCH_TERM", payload: value })
      dispatch({ type: "SET_PAGE", payload: 1 })
    }, 500),
    []
  )

  const handleInputChange = (e) => {
    debouncedInput(e.target.value)
  }

  const handlePressEnter = (e) => {
    debouncedInput.cancel()
    const value = e.target.value
    dispatch({ type: "SET_SEARCH_TERM", payload: value })
    dispatch({ type: "SET_PAGE", payload: 1 })
  }

  const handlePageChange = (page) => {
    dispatch({ type: "SET_PAGE", payload: page })
  }

  const handleRatingChange = ({ movieId, rating }) => {
    try {
      api.setMovieRate(movieId, guestSessionId, rating)
    } catch (error) {
      alert(`Ошибка при установке рейтинга фильма: ${error.message}`)
    }
  }

  const onTabClick = (key) => {
    dispatch({ type: "SET_ACTIVE_TAB", payload: key })
  }

  return (
    <GenresProvider genres={genres}>
      <Layout className="layout">
        <Tabs
          items={tabs}
          activeKey={activeTab}
          onChange={onTabClick}
          centered
          style={{ width: "100%", textAlign: "center" }}
        />
        <Content className="content center">
          <Spin spinning={loading}>
            {activeTab === "search" ? (
              <>
                <Input
                  className="search-panel"
                  placeholder="Введите название..."
                  onPressEnter={handlePressEnter}
                  onChange={handleInputChange}
                  defaultValue={searchTerm}
                />
                {movies.length > 0 ? (
                  <MovieList
                    movies={movies}
                    genres={genres}
                    onRatingChange={handleRatingChange}
                  />
                ) : (
                  showAlert && (
                    <Alert
                      message="Ошибка загрузки фильмов"
                      description="Пожалуйста, включите VPN, чтобы они появились в этом разделе."
                      type="info"
                      showIcon
                    />
                  )
                )}
                {totalResults > 20 && (
                  <Pagination
                    className="pagination"
                    current={currentPage}
                    total={totalResults > 400 ? totalResults / 2 : totalResults}
                    pageSize={20}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                  />
                )}
              </>
            ) : (
              <RatedItem guestSessionId={guestSessionId} />
            )}
          </Spin>
        </Content>
      </Layout>
    </GenresProvider>
  )
}

export default App
