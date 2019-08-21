import {Component, OnInit} from '@angular/core';
import {User} from './user';
import {UserService} from './user.service';

@Component({
  templateUrl: 'user.component.html'
})
export class UserComponent implements OnInit {

  users: User[] = [];
  user: User;
  selectedUser: User;
  isNew: boolean;
  displayDialog: boolean;

  constructor(private service: UserService) {}

  ngOnInit(): void {
    this.service.getAll()
      .then(data => {
        this.users = data;
      });
  }

  onRowSelect(event) {
    this.isNew = false;
    this.user = event.data;
    this.displayDialog = true;
  }

  showDialogToAdd() {
    this.isNew = true;
    this.user = new User();
    this.displayDialog = true;
  }

  delete() {
    this.service.delete(this.user._id)
      .then(() => {
        const index = this.users.indexOf(this.selectedUser);
        console.log(index);
        this.users.filter((val, idx) => idx !== index);
      })
      .catch(err => console.log(err));
    this.displayDialog = false;
  }

  save() {
    if (this.isNew) {
      this.service.save(this.user)
        .then(data => this.users.push(data))
        .catch(err => console.log(err));
    } else {
      this.service.update(this.user)
        .catch(err => console.log(err));
    }
    this.displayDialog = false;
  }

}
