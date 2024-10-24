export async function getServerSideProps({ res }) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({ message: "API 运行中" }));
    return { props: {} };
  }
  
  export default function Home() {
    return null;
  }
  