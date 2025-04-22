import React, { createContext, useContext } from "react"

const GenresContext = createContext([])

export function GenresProvider({ children, genres }) {
  return (
    <GenresContext.Provider value={genres}>{children}</GenresContext.Provider>
  )
}

export const useGenres = () => useContext(GenresContext)
