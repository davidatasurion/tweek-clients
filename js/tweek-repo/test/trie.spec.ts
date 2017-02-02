import 'mocha';
import {expect} from 'chai';
import Trie from '../trie';

let splitJoin ={
  split(key){ return key.split("")},
  join(fragment){ return fragment.join("")}
}

describe("read data from trie", ()=>{
    it("simple read", ()=>{
      let trie = new Trie(splitJoin);

      trie.set("hello", "world");
      expect(trie.get("hello")).to.eql("world");
    });

    it("list read", ()=>{
      let trie = new Trie(splitJoin);
      trie.set("hello", "world");
      trie.set("hell", "diablo");
      trie.set("help", "me");
      expect(trie.list("he")).to.eql({
        hello: "world",
        hell: "diablo",
        help: "me"
      });
      expect(trie.list("hell")).to.eql({
        hello: "world",
        hell: "diablo"
      });
    });

    it("list relative", ()=>{
      let trie = new Trie(splitJoin);
      trie.set("hello", "world");
      trie.set("hell", "diablo");
      expect(trie.listRelative("hel")).to.eql({
          lo: "world",
          l: "diablo"
      });
    });

    it("update value", ()=>{
      let trie = new Trie(splitJoin);
      trie.set("hello", "world");
      expect(trie.get("hello")).to.eql("world");
      trie.set("hello", "world2");
      expect(trie.get("hello")).to.eql("world2");
    });


})