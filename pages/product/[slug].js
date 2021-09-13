import React, { useContext, useEffect, useState } from 'react'
import NextLink from 'next/link'
import Image from 'next/image'
import {
  Grid,
  Link,
  List,
  ListItem,
  Typography,
  Card,
  Button,
  TextField,
  CircularProgress,
} from '@material-ui/core'
import Rating from '@material-ui/lab/Rating'
import Layout from '../../components/LayoutDetails'
import useStyles from '../../utils/styles'
import Product from '../../models/Product'
import User from '../../models/User'
import db from '../../utils/db'
import axios from 'axios'
import { Store } from '../../utils/Store'
import { getError } from '../../utils/error'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import UserAvater from '../../components/UserAvater'

export default function ProductScreen(props) {
  const router = useRouter()

  const { state, dispatch } = useContext(Store)
  const { userInfo } = state
  const { product, user } = props
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()

  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const submitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post(
        `/api/products/${product._id}/reviews`,
        {
          rating,
          comment,
        },
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      )
      setLoading(false)
      enqueueSnackbar('Review submitted successfully', { variant: 'success' })
      ratingHadler()
    } catch (err) {
      setLoading(false)
      enqueueSnackbar(getError(err), { variant: 'error' })
    }
  }

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/api/products/${product._id}/reviews`)
      setReviews(data)
    } catch (err) {
      enqueueSnackbar(getError(err), { variant: 'error' })
    }
  }
  const ratingHadler = (numReviews, rating) => {
    return (
      <ListItem>
        <Rating value={rating} readOnly></Rating>
        <Link href="#reviews">
          <Typography>({numReviews} reviews)</Typography>
        </Link>
      </ListItem>
    )
  }
  useEffect(() => {
    fetchReviews()
    ratingHadler()
  }, [])

  if (!product) {
    return <div>Product Not Found</div>
  }
  const addToCartHandler = async () => {
    const existItem = state.cart.cartItems.find((x) => x._id === product._id)
    const quantity = existItem ? existItem.quantity + 1 : 1
    const { data } = await axios.get(`/api/products/${product._id}`)
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock')
      return
    }
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } })
    router.push('/cart')
  }
  return (
    <Layout title={product.name} description={product.description}>
      <NextLink href="/" passHref className={classes.section}>
        <Link>
          <Typography>
            <ArrowBackIcon />
            back to products
          </Typography>
        </Link>
      </NextLink>

      <Grid container spacing={1}>
        <Grid item md={9} xs={12} spacing={1}>
          <Typography component="h1" variant="h1">
            {product.name}
          </Typography>
          <Typography align="right">{product.category}</Typography>
          <Image
            src={product.image}
            alt={product.name}
            width={640}
            height={640}
            layout="responsive"></Image>

          <Typography
            className="product-des"
            dangerouslySetInnerHTML={{
              __html: product.description,
            }}></Typography>
        </Grid>
        <Grid item md={3} xs={12}>
          <Card>
            <List>
              <ListItem>
                <Typography>Category: {product.category}</Typography>
              </ListItem>
              <ListItem>
                <Typography>Brand: {product.brand}</Typography>
              </ListItem>
              {ratingHadler(product.numReviews, product.rating)}
            </List>

            <List>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>Price</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>${product.price}</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>Status</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      {product.countInStock > 0 ? 'In stock' : 'Unavailable'}
                    </Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={addToCartHandler}>
                  Add to cart
                </Button>
              </ListItem>
            </List>
            {user.name}
            <UserAvater product={product} addToCartHandler={addToCartHandler} />
          </Card>
        </Grid>
      </Grid>

      <List>
        <ListItem>
          <Typography name="reviews" id="reviews" variant="h2">
            Customer Reviews
          </Typography>
        </ListItem>
        {reviews.length === 0 && <ListItem>No review</ListItem>}
        {reviews.map((review) => (
          <ListItem key={review._id}>
            <Grid container>
              <Grid item className={classes.reviewItem}>
                <Typography>
                  <strong>{review.name}</strong>
                </Typography>
                <Typography>{review.createdAt.substring(0, 10)}</Typography>
              </Grid>
              <Grid item>
                <Rating value={review.rating} readOnly></Rating>
                <Typography>{review.comment}</Typography>
              </Grid>
            </Grid>
          </ListItem>
        ))}
        <ListItem>
          {userInfo ? (
            <form onSubmit={submitHandler} className={classes.reviewForm}>
              <List>
                <ListItem>
                  <Typography variant="h2">Leave your review</Typography>
                </ListItem>
                <ListItem>
                  <TextField
                    multiline
                    variant="outlined"
                    fullWidth
                    name="review"
                    label="Enter comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </ListItem>
                <ListItem>
                  <Rating
                    name="simple-controlled"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  />
                </ListItem>
                <ListItem>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary">
                    Submit
                  </Button>

                  {loading && <CircularProgress></CircularProgress>}
                </ListItem>
              </List>
            </form>
          ) : (
            <Typography variant="h2">
              Please{' '}
              <Link href={`/login?redirect=/product/${product.slug}`}>
                login
              </Link>{' '}
              to write a review
            </Typography>
          )}
        </ListItem>
      </List>
    </Layout>
  )
}
export async function getServerSideProps(context) {
  const { params } = context
  const { slug } = params

  await db.connect()
  const product = await Product.findOne({ slug }, '-reviews').lean()
  const user = await User.findOne(product.user).lean()

  await db.disconnect()
  return {
    props: {
      product: db.convertDocToObj(JSON.parse(JSON.stringify(product))),
      user: db.convertDocToObj(JSON.parse(JSON.stringify(user))),
    },
  }
}
