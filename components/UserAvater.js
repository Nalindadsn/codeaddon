import { Card, CardActions, Typography } from '@material-ui/core'
import React from 'react'
import NextLink from 'next/link'
import Rating from '@material-ui/lab/Rating'

export default function UserAvater({ user }) {
  return <Typography>{user}</Typography>
}
