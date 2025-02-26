contract SelfDestructible {
  constructor(address recipient) payable {
    selfdestruct(payable(recipient));
  }
}
