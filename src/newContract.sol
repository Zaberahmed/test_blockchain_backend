// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DataStorage {
    address public creator;

    struct Data {
        string userId;
        string email;
        string shipmentServiceCode;
        string carrierName;
        string createdAt;
        string status;
        string selectedRate;
        string noOfInstallments;
        string netPayable;
        string insuranceAmount;
        string paymentMethod;
        string[] instalmentDeadLine;
        string[] payableAmount;
        string[] paymentDate;
        string[] paidAmount;
    }

    mapping(bytes32 => Data) public dataMap;
    bytes32[] public dataKeys;

    event DataCreated(
        bytes32 indexed transactionHash,
        string userId,
        string email,
        string shipmentServiceCode,
        string carrierName,
        string createdAt,
        string status,
        string selectedRate,
        string noOfInstallments,
        string netPayable,
        string insuranceAmount,
        string paymentMethod
    );
    event updateInstalmentData(
        string[] instalmentDeadLine,
        string[] payableAmounta
    );
    event StatusUpdated(bytes32 indexed transactionHash, string status);
    event PaidAmountUpdated(
        bytes32 indexed transactionHash,
        string[] paidAmount,
        string[] paymentDate
    );

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
        string memory _userId,
        string memory _email,
        string memory _shipmentServiceCode,
        string memory _carrierName,
        string memory _createdAt,
        string memory _status,
        string memory _selectedRate,
        string memory _noOfInstallments,
        string memory _netPayable,
        string memory _insuranceAmount,
        string memory _paymentMethod
    ) public onlyCreator {
        bytes32 transactionHash = keccak256(
            abi.encodePacked(block.timestamp, msg.sender, _email)
        );
        Data storage newData = dataMap[transactionHash];
        newData.userId = _userId;
        newData.email = _email;
        newData.shipmentServiceCode = _shipmentServiceCode;
        newData.carrierName = _carrierName;
        newData.createdAt = _createdAt;
        newData.status = _status;
        newData.selectedRate = _selectedRate;
        newData.noOfInstallments = _noOfInstallments;
        newData.netPayable = _netPayable;
        newData.paymentMethod = _paymentMethod;

        dataKeys.push(transactionHash);
        emit DataCreated(
            transactionHash,
            _userId,
            _email,
            _shipmentServiceCode,
            _carrierName,
            _createdAt,
            _status,
            _selectedRate,
            _noOfInstallments,
            _netPayable,
            _insuranceAmount,
            _paymentMethod
        );
    }

    function setInstallmentData(
        bytes32 _transactionHash,
        string[] memory _instalmentDeadLine,
        string[] memory _payableAmount
    ) public onlyCreator {
        Data storage newData = dataMap[_transactionHash];

        newData.instalmentDeadLine = _instalmentDeadLine;
        newData.payableAmount = _payableAmount;

        emit updateInstalmentData(
            newData.instalmentDeadLine,
            newData.payableAmount
        );
    }

    function updateStatus(
        bytes32 _transactionHash,
        string memory _status
    ) public onlyCreator {
        Data storage existingData = dataMap[_transactionHash];
        require(
            bytes(existingData.email).length != 0,
            "Data with this transaction hash does not exist"
        );

        existingData.status = _status;

        emit StatusUpdated(_transactionHash, _status);
    }

    function updateInstalment(
        bytes32 _transactionHash,
        string memory _paidAmount,
        string memory _paymentDate
    ) public onlyCreator {
        Data storage existingData = dataMap[_transactionHash];
        require(
            bytes(existingData.email).length != 0,
            "Data with this transaction hash does not exist"
        );

        existingData.paymentDate.push(_paymentDate);
        existingData.paidAmount.push(_paidAmount);

        emit PaidAmountUpdated(
            _transactionHash,
            existingData.paidAmount,
            existingData.paymentDate
        );
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
            string memory userId,
            string memory email,
            string memory shipmentServiceCode,
            string memory carrierName,
            string memory createdAt,
            string memory status,
            string memory selectedRate,
            string memory noOfInstallments,
            string memory netPayable,
            string memory insuranceAmount,
            string memory paymentMethod
        )
    {
        Data storage data = dataMap[_transactionHash];
        require(
            bytes(data.email).length != 0,
            "Data with this transaction hash does not exist"
        );

        return (
            data.userId,
            data.email,
            data.shipmentServiceCode,
            data.carrierName,
            data.createdAt,
            data.status,
            data.selectedRate,
            data.noOfInstallments,
            data.netPayable,
            data.insuranceAmount,
            data.paymentMethod
        );
    }

    function getInstalmentDataByTransactionHash(
        bytes32 _transactionHash
    )
        public
        view
        returns (
            string[] memory instalmentDeadLine,
            string[] memory payableAmount,
            string[] memory paymentDate,
            string[] memory paidAmount
        )
    {
        Data storage data = dataMap[_transactionHash];
        require(
            bytes(data.email).length != 0,
            "Data with this transaction hash does not exist"
        );

        return (
            data.instalmentDeadLine,
            data.payableAmount,
            data.paymentDate,
            data.paidAmount
        );
    }
}
