/* eslint-disable @next/next/no-img-element */
import NextLink from 'next/link'
import { Container, Grid, Link, Typography } from '@material-ui/core'
import Layout from '../components/Layout'
import db from '../utils/db'
import Product from '../models/Product'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useContext } from 'react'
import { Store } from '../utils/Store'
import ProductItem from '../components/ProductItem'
import Carousel from 'react-material-ui-carousel'
import useStyles from '../utils/styles'
import Leftbar from './components/Leftbar'
import Feed from './components/Feed'
import Post from './components/Post'
import { TreeItem, TreeView } from '@material-ui/lab'

const data = {
  id: 'root',
  name: 'Parent',
  children: [
    {
      id: '1',
      name: 'Child - 1',
    },
    {
      id: '3',
      name: 'Child - 3',
      children: [
        {
          id: '4',
          name: 'Child - 4',
        },
      ],
    },
  ],
}
export default function Home(props) {
  const classes = useStyles()
  const router = useRouter()
  const { state, dispatch } = useContext(Store)
  const { topRatedProducts, featuredProducts, latestProducts } = props
  const addToCartHandler = async (product) => {
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

  const renderTree = (nodes) => (
    <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.name}>
      {Array.isArray(nodes.children)
        ? nodes.children.map((node) => renderTree(node))
        : null}
    </TreeItem>
  )

  return (
    <Layout>
      {/* <Carousel className={classes.mt1} animation="slide">
        {featuredProducts.map((product) => (
          <NextLink
            key={product._id}
            href={`/product/${product.slug}`}
            passHref>
            <Link>
              <img
                src={product.featuredImage}
                alt={product.name}
                className={classes.featuredImage}></img>
            </Link>
          </NextLink>
        ))}
      </Carousel> */}

      <Grid container>
        {/* <Grid item sm={2} xs={2}>
            <Leftbar />
          </Grid> */}
        <Grid item sm={3}>
          <TreeView
            className={classes.root}
            defaultCollapseIcon={'-'}
            defaultExpanded={['root']}
            defaultExpandIcon={'+'}>
            {renderTree(data)}
          </TreeView>
        </Grid>
        <Grid item sm={9} xs={12}>
          <Container>
            <Typography variant="h1">Latest Posts</Typography>
            <Grid>
              {latestProducts.map((product) => (
                <Post
                  key={product._id}
                  title={product.name}
                  img={product.image}
                  id={product.slug}
                  desc={product.description}
                />
              ))}
            </Grid>
            <Typography variant="h2">Popular Articles</Typography>
            <Grid container spacing={3}>
              {topRatedProducts.map((product) => (
                <Grid item md={4} key={product.name}>
                  <ProductItem
                    product={product}
                    addToCartHandler={addToCartHandler}
                  />
                </Grid>
              ))}
            </Grid>
          </Container>
        </Grid>
      </Grid>
    </Layout>
  )
}

export async function getServerSideProps() {
  await db.connect()
  const featuredProductsDocs = await Product.find(
    { isFeatured: true },
    '-reviews'
  )
    .lean()
    .limit(6)

  const latestProductsDocs = await Product.find({})
    .lean()
    .sort({
      createdAt: -1,
    })
    .limit(6)

  const topRatedProductsDocs = await Product.find({}, '-reviews')
    .lean()
    .sort({
      rating: -1,
    })
    .limit(6)

  await db.disconnect()
  return {
    props: {
      featuredProducts: JSON.parse(JSON.stringify(featuredProductsDocs)).map(
        db.convertDocToObj
      ),
      topRatedProducts: JSON.parse(JSON.stringify(topRatedProductsDocs)).map(
        db.convertDocToObj
      ),
      latestProducts: JSON.parse(JSON.stringify(latestProductsDocs)).map(
        db.convertDocToObj
      ),
    },
  }
}
