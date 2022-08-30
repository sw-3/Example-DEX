// Javascript component to allow a text argument to render on the page

const Banner = ({ text }) => {
  return (
    <div className='banner'>
      <h1>{text}</h1>
    </div>
  );
}

export default Banner;
