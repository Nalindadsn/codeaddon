import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  makeStyles,
  Typography,
} from '@material-ui/core'
import Link from 'next/link'

import NextLink from 'next/link'
const useStyles = makeStyles((theme) => ({
  card: {
    marginBottom: theme.spacing(5),
  },
  media: {
    height: 250,
    [theme.breakpoints.down('sm')]: {
      height: 150,
    },
  },
}))

const Post = ({ img, title, id, desc }) => {
  const classes = useStyles()
  return (
    <Card className={classes.card}>
      <NextLink href={`/product/${id}`} passHref>
        <CardActionArea>
          <CardMedia className={classes.media} image={img} title="My Post" />
          <CardContent>
            <Typography gutterBottom variant="h5">
              {title}
            </Typography>
            <Typography variant="body2">{desc.substring(0, 300)}</Typography>
          </CardContent>
        </CardActionArea>
      </NextLink>
      <CardActions>
        <NextLink href={`/product/${id}`} passHref>
          <Link>
            <Button size="small" color="primary">
              Share
            </Button>
          </Link>
        </NextLink>
        <Button size="small" color="primary">
          Learn More
        </Button>
      </CardActions>
    </Card>
  )
}

export default Post
