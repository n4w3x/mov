/* eslint-disable no-param-reassign */
import React, { useEffect, useState } from "react"
import {
  Card,
  Typography,
  Row,
  Col,
  Progress,
  Rate,
  Tag,
  Spin,
  Image,
} from "antd"
import { format } from "date-fns"

const { Paragraph } = Typography

function MovieItem({ movie, genres, onRatingChange }) {
  const [userRating, setUserRating] = useState(movie.rating || null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (movie) {
      setLoading(false)
    }
  }, [movie])

  if (loading) {
    return <Spin />
  }

  const {
    title,
    release_date,
    genre_ids,
    overview,
    poster_path,
    vote_average,
  } = movie

  const genresMap = genres.reduce((map, g) => {
    map[g.id] = g.name
    return map
  }, {})
  const movieGenres = genre_ids.map((id) => genresMap[id])

  const handleRatingChange = (value) => {
    setUserRating(value)
    if (onRatingChange) {
      onRatingChange({
        movieId: movie.id,
        rating: value,
      })
    }
  }

  let formattedReleaseDate
  try {
    formattedReleaseDate = format(new Date(release_date), "MMMM d, yyyy")
  } catch (error) {
    console.log("Ошибка при форматировании даты:", error.message)
    formattedReleaseDate = "Invalid Date"
  }

  const movieRate = vote_average
  let movieRateColor

  if (movieRate >= 7) {
    movieRateColor = "#66E900"
  } else if (movieRate >= 5) {
    movieRateColor = "#E9D100"
  } else if (movieRate >= 3) {
    movieRateColor = "#E97E00"
  } else {
    movieRateColor = "#E90000"
  }

  function truncateText(text, maxLength) {
    if (text.length <= maxLength) {
      return text
    }

    const truncatedText = text.substr(0, maxLength)
    const lastSpaceIndex = truncatedText.lastIndexOf(" ")

    if (lastSpaceIndex !== -1) {
      return `${truncatedText.substr(0, lastSpaceIndex)}...`
    }

    return `${truncatedText}...`
  }
  const posterSrc = poster_path
    ? `https://image.tmdb.org/t/p/w500${poster_path}`
    : null

  return (
    <Card hoverable className="card">
      <Row gutter={[16, 16]}>
        <Col span={10}>
          <div className="image-container">
            <Image
              src={posterSrc}
              alt={title}
              placeholder
              fallback="./placeholder.png"
              style={{ minHeight: "280px", objectFit: "cover" }}
            />
          </div>
        </Col>
        <Col
          span={14}
          style={{
            padding: 12,
            display: "inline-flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Row span={10}>
            <Col span={20} style={{ maxWidth: "205px" }}>
              <div
                style={{
                  width: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                <Typography.Text copyable style={{ lineHeight: "30px" }}>
                  {truncateText(title, 25)}
                </Typography.Text>
              </div>
              <div>
                <span className="date">{formattedReleaseDate}</span>
              </div>
              <div className="genres-container">
                {movieGenres && movieGenres.length > 0 ? (
                  movieGenres.slice(0, 2).map((genre) => (
                    <Tag key={genre} className="genres">
                      {genre}
                    </Tag>
                  ))
                ) : (
                  <span>Ошибка обработки жанров</span>
                )}
              </div>
              <div>
                <Paragraph className="description">
                  {truncateText(overview, 167)}
                </Paragraph>
              </div>
            </Col>

            <Col span={4}>
              <Progress
                type="dashboard"
                percent={movieRate * 10}
                size={30}
                format={(percent) => Math.round(percent * 10) / 100}
                strokeColor={movieRateColor}
              />
            </Col>
          </Row>
          <Row span={10}>
            <Col span={24}>
              <div>
                <Rate
                  allowHalf
                  count={10}
                  style={{ fontSize: "16px" }}
                  value={userRating}
                  onChange={handleRatingChange}
                />
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  )
}

export default MovieItem
