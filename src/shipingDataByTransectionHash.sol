// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DataStorage {
    address public creator;

    struct Data {
        string username;
        uint256 price;
        string status;
        string productName;
    }

    mapping(bytes32 => Data) public dataMap;
    bytes32[] public dataKeys;

    event DataCreated(
        bytes32 indexed transactionHash,
        string username,
        uint256 price,
        string status,
        string productName
    );
    event StatusUpdated(bytes32 indexed transactionHash, string status);

    constructor() {
        creator = msg.sender;
    }

    modifier onlyCreator() {
        require(
            msg.sender == creator,
            "Only the creator can perform this operation"
        );
        _;
    }

    function createData(
        string memory _username,
        uint256 _price,
        string memory _status,
        string memory _productName
    ) public onlyCreator {
        bytes32 transactionHash = keccak256(
            abi.encodePacked(block.timestamp, msg.sender, _username)
        );
        Data storage newData = dataMap[transactionHash];
        newData.username = _username;
        newData.price = _price;
        newData.status = _status;
        newData.productName = _productName;

        dataKeys.push(transactionHash);
        emit DataCreated(
            transactionHash,
            _username,
            _price,
            _status,
            _productName
        );
    }

    function updateStatus(
        bytes32 _transactionHash,
        string memory _status
    ) public onlyCreator {
        Data storage existingData = dataMap[_transactionHash];
        require(
            bytes(existingData.username).length != 0,
            "Data with this transaction hash does not exist"
        );

        existingData.status = _status;

        emit StatusUpdated(_transactionHash, _status);
    }

    function getAllData() public view returns (bytes32[] memory) {
        return dataKeys;
    }

    function getDataByTransactionHash(
        bytes32 _transactionHash
    )
        public
        view
        returns (
            string memory username,
            uint256 price,
            string memory status,
            string memory productName
        )
    {
        Data storage data = dataMap[_transactionHash];
        require(
            bytes(data.username).length != 0,
            "Data with this transaction hash does not exist"
        );
        return (data.username, data.price, data.status, data.productName);
    }
}
