import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react';
import './Home.css';
import Cube from '../components/Cube';

const Home: React.FC = () => {

  const [index, setIndex] = React.useState(0);

  const w = window.innerWidth - 25;
  const h = window.innerHeight - 25;

  const images = [
    'https://images.unsplash.com/photo-1565371557106-c2abcc6fb36a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80',
    'https://images.unsplash.com/photo-1565361849078-294849288ced?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80',
    'https://images.unsplash.com/photo-1565279799937-b397e6483124?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=619&q=80',
    'https://images.unsplash.com/photo-1565264216052-3c9012481a1f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80',
    'https://images.unsplash.com/photo-1565274952013-13cecde5c8b1?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80',
    'https://images.unsplash.com/photo-1565287753977-e94d0227c640?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=633&q=80',
    'https://images.unsplash.com/photo-1565340076861-7a6667b36072?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=700&q=80',
    'https://images.unsplash.com/photo-1565259901762-b8d797c6f887?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80',
];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Blank</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Blank</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
            }}
        >
            <Cube
                index={index}
                onChange={(i) => setIndex(i)}
                width={w > 375 ? 375 : w}
                height={h > 600 ? 600 : h}
                lockScrolling
                hasNext={(i) => i < images.length - 1}
                renderItem={(i, active) => {
                    return (
                        <>
                            {i > -1 && i < images.length && (
                                <div
                                    className="safe-area-inset-top-margin"
                                    style={{
                                        backgroundImage: `url(${images[i]})`,
                                        backgroundSize: 'cover',
                                        flex: 1,
                                        borderRadius: '12px 12px 0 0',
                                    }}
                                >
                                </div>
                            )}
                        </>
                    );
                }}
            />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
