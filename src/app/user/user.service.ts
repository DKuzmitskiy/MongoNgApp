import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {User} from './user';

@Injectable()
export class UserService {

  constructor(private http: HttpClient) {}

  getAll(): Promise<User[]> {
    return this.http.get('/api/users').toPromise()
      .then((data: User[]) => data)
      .catch(err => err);
  }

  getById(id: string): Promise<User> {
    return this.http.get('/api/users/' + id).toPromise()
      .then((data: User) => data)
      .catch(err => err);
  }

  save(body: User): Promise<User> {
    return this.http.post('/api/users', body).toPromise()
      .then((data: User) => data)
      .catch(err => err);
  }

  update(body: User): Promise<User> {
    return this.http.put('/api/users', body).toPromise()
      .then((data: User) => data)
      .catch(err => err);
  }

  delete(id: string): Promise<User> {
    return this.http.delete('/api/users/' + id).toPromise()
      .then((data: User) => data)
      .catch(err => err);
  }

}
